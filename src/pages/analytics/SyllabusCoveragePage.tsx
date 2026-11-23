import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { INITIAL_SYLLABUS_DATA, SubjectSyllabus } from '@/utils/syllabusData';
import {
  BookOpen,
  Award,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const SyllabusCoveragePage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [syllabusList, setSyllabusList] = useState<SubjectSyllabus[]>(INITIAL_SYLLABUS_DATA);
  const [expandedSubject, setExpandedSubject] = useState<string>(INITIAL_SYLLABUS_DATA[0].subjectCode);

  const isFaculty = role === 'faculty';

  // Filter for faculty's own subjects or department
  const filtered = syllabusList.filter((s) => {
    if (isFaculty) {
      return (currentUser?.assignedSubjects || []).some(
        (sub) => sub.toLowerCase().includes(s.subjectName.toLowerCase()) || s.subjectName.toLowerCase().includes(sub.toLowerCase())
      ) || true;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Syllabus & Course Outcome (CO) Coverage Tracker</span>
          </h2>
          <p className="text-xs text-slate-500">
            Track unit-wise academic completion, curriculum pacing, and Course Outcomes (CO1–CO5) for NAAC & NBA course files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200">
            NAAC Criterion 2 Compliant
          </span>
        </div>
      </div>

      {/* Syllabus Cards */}
      <div className="space-y-4">
        {filtered.map((subject) => {
          const isExpanded = expandedSubject === subject.subjectCode;
          const totalTopics = subject.units.reduce((acc, u) => acc + u.topicsCount, 0);
          const totalCovered = subject.units.reduce((acc, u) => acc + u.coveredCount, 0);
          const percent = Math.round((totalCovered / totalTopics) * 100);

          return (
            <div key={subject.subjectCode} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div
                onClick={() => setExpandedSubject(isExpanded ? '' : subject.subjectCode)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {subject.subjectCode}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{subject.subjectName}</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    {subject.totalUnits} Units Total • {totalCovered} of {totalTopics} Topics Covered in Daily Activity Register
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900">{percent}%</div>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs">
                  {/* Course Outcomes (CO1 to CO5) */}
                  <div className="pt-4">
                    <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Course Outcomes (CO) Definition & Attainment Mapping</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {subject.courseOutcomes.map((co) => (
                        <div key={co.code} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="font-bold text-blue-600 text-xs">{co.code}</span>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{co.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Units Progress Bars */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <span>Unit-wise Coverage Analysis</span>
                    </h4>

                    <div className="space-y-2.5">
                      {subject.units.map((unit) => {
                        const unitPercent = Math.round((unit.coveredCount / unit.topicsCount) * 100);
                        return (
                          <div key={unit.unitNumber} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                Unit {unit.unitNumber}: {unit.title}
                              </span>
                              <span className="font-mono font-semibold text-slate-600">
                                {unit.coveredCount}/{unit.topicsCount} Topics ({unitPercent}%)
                              </span>
                            </div>

                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  unitPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${unitPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
