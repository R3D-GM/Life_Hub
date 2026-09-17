"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Semester { id: string; label: string; }
interface Course { id: string; name: string; code: string | null; creditHours: number | null; }
interface Task { id: string; description: string; deadline: string | null; status: string; courseName?: string; }

export default function UniversityPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemester] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [label, setLabel] = useState("");
  const [courseCount, setCourseCount] = useState(5);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskCourse, setTaskCourse] = useState("");
  const [upcoming, setUpcoming] = useState<Task[]>([]);

  async function load() {
    const s = await api.get<{ semesters: Semester[] }>("/api/university/semesters");
    setSemesters(s.semesters);
    if (s.semesters[0]) setActiveSemester((prev) => prev || s.semesters[0].id);
    const up = await api.get<{ tasks: Task[] }>("/api/university/tasks/upcoming");
    setUpcoming(up.tasks);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!activeSemester) return;
    api.get<{ courses: Course[] }>(`/api/university/semesters/${activeSemester}/courses`).then((d) => {
      setCourses(d.courses);
      if (d.courses[0]) setTaskCourse((prev) => prev || d.courses[0].id);
    });
  }, [activeSemester]);

  async function setupSemester() {
    if (!label) return;
    const result = await api.post<{ semester: Semester }>("/api/university/semesters/setup", {
      clientId: crypto.randomUUID(), label, courseCount,
    });
    setLabel("");
    setActiveSemester(result.semester.id);
    load();
  }

  async function renameCourse(id: string, name: string) {
    await api.patch(`/api/university/courses/${id}`, { name });
  }

  async function addTask() {
    if (!taskDesc || !taskCourse) return;
    await api.post("/api/university/tasks", { clientId: crypto.randomUUID(), courseId: taskCourse, description: taskDesc });
    setTaskDesc("");
    load();
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">University</h1>

      {semesters.length === 0 ? (
        <div className="card">
          <p className="mb-2 text-sm">Set up your semester to add your courses.</p>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. 2026/27 Semester 1"
            className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          <label className="mb-1 block text-xs text-[var(--muted)]">How many courses are you taking?</label>
          <input type="number" min={1} max={20} value={courseCount} onChange={(e) => setCourseCount(Number(e.target.value))}
            className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          <button onClick={setupSemester} className="w-full rounded-xl bg-[var(--accent)] py-2 text-sm text-white">Set up semester</button>
        </div>
      ) : (
        <>
          <select value={activeSemester} onChange={(e) => setActiveSemester(e.target.value)}
            className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <div className="flex flex-col gap-2">
            {courses.map((c) => (
              <input key={c.id} defaultValue={c.name} onBlur={(e) => renameCourse(c.id, e.target.value)}
                className="card text-sm font-medium" />
            ))}
          </div>

          <div className="card my-4">
            <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">Add task</p>
            <select value={taskCourse} onChange={(e) => setTaskCourse(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="e.g. Assignment 2 due"
              className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
            <button onClick={addTask} className="w-full rounded-xl bg-[var(--accent)] py-2 text-sm text-white">Add</button>
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">Upcoming</p>
          <div className="flex flex-col gap-2">
            {upcoming.map((t) => (
              <div key={t.id} className="card flex justify-between text-sm">
                <span>{t.description}</span>
                <span className="text-[var(--muted)]">{t.deadline && new Date(t.deadline).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
