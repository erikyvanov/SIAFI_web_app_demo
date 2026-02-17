import { type FormState } from '../types/FormData';

export const getInitialState = (): FormState => {
  const demoPhoneNumber = `55${Date.now().toString().slice(-8)}`;

  return {
    recruitment_event_id: 1, // O el ID que corresponda
    name: '',
    lastname: '',
    phone_number: demoPhoneNumber,
    email: '',
    major: 'Ingeniería en Computación',
    semester: 7,
    contribution_text: 'Me interesa aportar en proyectos con organización y ejecución constante.',
    soft_skills_text: 'En equipos multidisciplinarios he facilitado comunicación y acuerdos claros.',
    proud_moment_text: 'Lideré un proyecto académico y logramos resultados sobresalientes en tiempo.',
    team_inspiration_text: 'Me inspira construir soluciones útiles junto con personas comprometidas.',
    why_join_text: 'Quiero crecer en IA aplicada y aportar con iniciativa en cada etapa.',
    how_found_us_text: 'redes_sociales',
    expectations_text: 'Espero aprender, colaborar en proyectos reales y fortalecer habilidades técnicas.',
    selected_nuclei: ['proyectos'],
    additional_info_text: 'Disponible para colaborar entre semana por las tardes.',
    other_skills_text: 'Interés en arquitectura de software y buenas prácticas de desarrollo.',
    previous_experience_text: 'He participado en hackatones y proyectos universitarios de software.',
    skill_csharp: 2,
    skill_c: 2,
    skill_cpp: 2,
    skill_java: 3,
    skill_javascript: 4,
    skill_python: 4,
    skill_tensorflow_keras: 2,
    skill_pytorch: 2,
    skill_scikit_learn: 3,
    skill_opencv: 1,
    skill_linux: 3,
    skill_ros_docker: 2,
    skill_raspberry: 1,
    skill_esp32: 1,
    skill_arduino: 2,
    skill_tiva: 0,
    development_areas: ['desarrollo_backend', 'desarrollo_modelos_ia'],
    detailed_experience_text: 'Desarrollé una API para clasificación de datos y la documenté en equipo.',
    cv: null,
  };
};
