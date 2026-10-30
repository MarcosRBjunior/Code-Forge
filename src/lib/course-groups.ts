/** Seções em que os cursos aparecem no menu e na página inicial, na ordem de exibição. */
export type CourseGroup = "entrevistas" | "fundamentos" | "ia" | "linguagens";

export const COURSE_GROUPS: Array<{ id: CourseGroup; title: string }> = [
  { id: "entrevistas", title: "Entrevistas" },
  { id: "fundamentos", title: "Fundamentos de computação" },
  { id: "ia", title: "Inteligência artificial" },
  { id: "linguagens", title: "Linguagens" },
];
