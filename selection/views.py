from django.shortcuts import render
from rest_framework import viewsets
from .serializers import StudentSerializer, CourseSerializer
from .models import Student, Course
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
import statistics
from json.decoder import JSONDecodeError
from scipy.stats import t
import math

FIXED_BUFFER_TOTAL = 0.05
FIXED_BUFFER_CAT = 0.25
BIN_COUNT = 7
CONF_LEVEL = 0.95


class StudentView(APIView):
    def get(self, request):
        return StudentView.fetch_course_name_data()

    def post(self, request):
        return StudentView.fetch_course_successor_data(request.data["originCourse"], request.data["successorList"],
                                                   request.data["gradeData"])

    @staticmethod
    def fetch_course_name_data():
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    @staticmethod
    def fetch_course_successor_data(origin_name: str, successor_list_json: str, grade_data_json: str):
        try:
            cf = JSONCourseFetcher(origin_name, successor_list_json, grade_data_json)
            return_package = cf.create_package()
            return JsonResponse(return_package)

        except (IndexError, KeyError, AssertionError, ValueError, AttributeError, TypeError, JSONDecodeError):
            return Response('ERROR: BAD REQUEST.', status=status.HTTP_400_BAD_REQUEST)


class JSONCourseFetcher:
    # helper inner class
    class Counter:
        def __init__(self):
            self.sum = 0
            self.count = 0

        def get_avg(self):
            if self.count == 0:
                return 0

            return self.sum / self.count

    def __init__(self, origin_name: str, successor_list_json: str, grade_data_json: str):
        self.successor_list = json.loads(successor_list_json)
        self.grade_data = json.loads(grade_data_json)
        self.origin_course = None
        self.origin_name = origin_name
        self.successors = []
        self.successor_names = []
        self.cat_grades = []
        self.grade_total = []
        self.return_package = {}
        self.series_dict = {}

        self.cat_grades = None
        self.grade_total = None

    def create_package(self):
        self.init_data()
        self.populate_raw_data()
        self.calculate_values()
        return self.return_package

    def init_data(self):
        if not Course.objects.filter(name=self.origin_name).exists():
            raise AssertionError

        self.origin_course = Course.objects.filter(name=self.origin_name)[0]

        for unverified_name in self.successor_list:
            if not Course.objects.filter(name=unverified_name).exists():
                raise AssertionError

            self.successor_names.append(unverified_name)
            self.successors.append(Course.objects.filter(name=unverified_name)[0])

        self.cat_grades = {k: self.grade_data[k] for k in self.grade_data.keys() if k != 'TOTAL'}
        self.grade_total = self.grade_data['TOTAL']

        o_s1_cat_names = json.loads(self.origin_course.s1_cat_names)

        if len(self.cat_grades) != len(o_s1_cat_names):
            raise AssertionError

        for cat_name in o_s1_cat_names:
            if cat_name not in self.cat_grades or self.cat_grades[cat_name] < 0 or self.cat_grades[cat_name] > 1:
                raise AssertionError

        for suc in self.successors:
            self.return_package[suc.name] = {
                "MatchTotalMean": self.Counter(),
                "CourseTotalMean": self.Counter(),
                "MatchS1Mean": self.Counter(),
                "CourseS1Mean": self.Counter(),
                "MatchS2Mean": self.Counter(),
                "CourseS2Mean": self.Counter(),
                "MatchCount": 0,
                "CourseCount": 0,
                "MatchMedian": 0,
                "CourseMedian": 0,
                "MatchStDev": 0,
                "CourseStDev": 0,
                "MatchS1CatMeans": {x: self.Counter() for x in json.loads(suc.s1_cat_names)},
                "CourseS1CatMeans":{x: self.Counter() for x in json.loads(suc.s1_cat_names)},
                "MatchS2CatMeans": {x: self.Counter() for x in json.loads(suc.s2_cat_names)},
                "CourseS2CatMeans":{x: self.Counter() for x in json.loads(suc.s2_cat_names)},
                "Ranking": 0,
                "HistogramBinNames": [],
                "HistogramBinValues": [],
                "TCriticalValue": 0,
                "OriginCourse": self.origin_name
            }
            self.series_dict[suc.name] = {
                "CourseSeries": [],
                "MatchSeries": []
            }

    def populate_raw_data(self):
        for student in Student.objects.all():
            credits_ordered = student.credits.order_by('year')
            prev_credit = None
            for cur_credit in credits_ordered:

                # for a course to be a successor, it must be taken the year after with no gaps
                if prev_credit and prev_credit.year + 1 == cur_credit.year and prev_credit.name == self.origin_course.name:
                    for name in self.successor_names:
                        if cur_credit.name == name:

                            # update course data
                            total_grade = (cur_credit.s1_total + cur_credit.s2_total) / 2
                            self.series_dict[name]["CourseSeries"].append(total_grade)
                            self.return_package[name]["CourseTotalMean"].sum += total_grade
                            self.return_package[name]["CourseTotalMean"].count += 1

                            self.return_package[name]["CourseS1Mean"].sum += cur_credit.s1_total
                            self.return_package[name]["CourseS1Mean"].count += 1

                            self.return_package[name]["CourseS2Mean"].sum += cur_credit.s2_total
                            self.return_package[name]["CourseS2Mean"].count += 1

                            self.return_package[name]["CourseCount"] += 1

                            suc_s1_cat_grades = json.loads(cur_credit.s1_cat_grades)
                            for cat, grade in suc_s1_cat_grades.items():
                                self.return_package[name]["CourseS1CatMeans"][cat].sum += grade
                                self.return_package[name]["CourseS1CatMeans"][cat].count += 1

                            suc_s2_cat_grades = json.loads(cur_credit.s2_cat_grades)
                            for cat, grade in suc_s2_cat_grades.items():
                                self.return_package[name]["CourseS2CatMeans"][cat].sum += grade
                                self.return_package[name]["CourseS2CatMeans"][cat].count += 1

                            # determine whether or not this student's course is a match for the requesting student, aka:
                            # check whether this student's grades were similar to the those of the requesting student
                            if JSONCourseFetcher.is_match(self.cat_grades, json.loads(prev_credit.s1_cat_grades),
                                             self.grade_total, prev_credit.s1_total):
                                JSONCourseFetcher.update_match_data(cur_credit, self.return_package[name],
                                                       self.series_dict[name]["MatchSeries"])
                prev_credit = cur_credit

    def calculate_values(self):
        for name in self.successor_names:

            # all means and cat means are currently counter objects
            # we will resolve these into float values which can be communicated through a JSON response
            for mean in ["CourseTotalMean", "CourseS1Mean", "CourseS2Mean", "MatchTotalMean", "MatchS1Mean", "MatchS2Mean"]:
                self.return_package[name][mean] = self.return_package[name][mean].get_avg()

            for cat_mean in ["MatchS1CatMeans", "MatchS2CatMeans", "CourseS1CatMeans", "CourseS2CatMeans"]:
                for cat, counter in self.return_package[name][cat_mean].items():
                    self.return_package[name][cat_mean][cat] = counter.get_avg()

            if self.series_dict[name]["CourseSeries"]:
                for value in self.series_dict[name]["CourseSeries"]:
                    if value < self.return_package[name]["MatchTotalMean"]:
                        self.return_package[name]["Ranking"] += 1
                        self.return_package[name]["CourseMedian"] = statistics.median(self.series_dict[name]["CourseSeries"])

            if len(self.series_dict[name]["CourseSeries"]) > 1:
                self.return_package[name]["CourseStDev"] = statistics.stdev(self.series_dict[name]["CourseSeries"])

            if self.series_dict[name]["MatchSeries"]:
                s_match_series = sorted(self.series_dict[name]["MatchSeries"])
                min_val = s_match_series[0]
                max_val = s_match_series[-1]
                bin_size = (max_val - min_val) / BIN_COUNT

                thresholds = [(x + 1) * bin_size + min_val for x in range(BIN_COUNT)]
                bin_names = [str((round((x * bin_size + min_val) * 100, 2), round(((x + 1) * bin_size + min_val) * 100, 2))) for x in range(BIN_COUNT)]

                counts = [0] * BIN_COUNT
                i = 0
                for value in s_match_series:
                    if value > thresholds[i]:
                        i += 1
                    counts[i] += 1

                self.return_package[name]["HistogramBinNames"] = bin_names
                self.return_package[name]["HistogramBinValues"] = counts
                self.return_package[name]["MatchMedian"] = statistics.median(self.series_dict[name]["MatchSeries"])

            if len(self.series_dict[name]["MatchSeries"]) > 1:
                self.return_package[name]["MatchStDev"] = statistics.stdev(self.series_dict[name]["MatchSeries"])

            df = self.return_package[name]["MatchCount"] - 1
            tc_value = t.ppf(CONF_LEVEL, df)

            if math.isnan(tc_value):
                self.return_package[name]["TCriticalValue"] = 0
            else:
                self.return_package[name]["TCriticalValue"] = tc_value

                self.return_package[name]["Ranking"] += 1

    @staticmethod
    def is_match(grade_data, s1_cat_grades, grade_total, s1_total):
        if abs(grade_total - s1_total) > FIXED_BUFFER_TOTAL:
            return False
        for cat, grade in grade_data.items():
            if abs(s1_cat_grades[cat] - grade) > FIXED_BUFFER_CAT:
                return False
        return True

    @staticmethod
    def update_match_data(cur_credit, cur_response, cur_series):
        suc_s1_total = cur_credit.s1_total
        suc_s2_total = cur_credit.s2_total

        cur_response["MatchS1Mean"].sum += suc_s1_total
        cur_response["MatchS1Mean"].count += 1

        cur_response["MatchS2Mean"].sum += suc_s2_total
        cur_response["MatchS2Mean"].count += 1

        total_grade = (suc_s1_total + suc_s2_total) / 2
        cur_series.append(total_grade)

        cur_response["MatchTotalMean"].sum += total_grade
        cur_response["MatchTotalMean"].count += 1

        cur_response["MatchCount"] += 1

        # update counters
        suc_s1_cat_grades = json.loads(cur_credit.s1_cat_grades)
        for cat, grade in suc_s1_cat_grades.items():
            cur_response["MatchS1CatMeans"][cat].sum += grade
            cur_response["MatchS1CatMeans"][cat].count += 1

        suc_s2_cat_grades = json.loads(cur_credit.s2_cat_grades)
        for cat, grade in suc_s2_cat_grades.items():
            cur_response["MatchS2CatMeans"][cat].sum += grade
            cur_response["MatchS2CatMeans"][cat].count += 1
