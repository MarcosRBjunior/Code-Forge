/** Seções em que os cursos aparecem no menu e na página inicial, na ordem de exibição. */
export type CourseGroup = "entrevistas" | "fundamentos" | "ia" | "linguagens" | "projetos" | "carreiras";

export const COURSE_GROUPS: Array<{ id: CourseGroup; title: string }> = [
  { id: "entrevistas", title: "Entrevistas" },
  { id: "fundamentos", title: "Fundamentos de computação" },
  { id: "ia", title: "Inteligência artificial" },
  { id: "linguagens", title: "Linguagens" },
  { id: "projetos", title: "Projetos" },
  { id: "carreiras", title: "Carreiras" },
];
