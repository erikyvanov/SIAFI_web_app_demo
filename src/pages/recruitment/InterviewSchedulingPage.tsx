import { useState, useEffect } from "react";

import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { Calendar, TimeSlots } from "../../components/calendar";
import { Button } from "../../components/ui";
import { SiafiLogo } from "../../components/footer";
import SiafiLogoPng from "../../assets/SIAFI_logo.png";
import { Footer } from "../../layouts";
import { useToast } from "../../components/notifications/useToast";
import { NotificationContainer } from "../../components/notifications";
import type {
  UserApplication,
  RecruitmentEvent,
  WeeklySchedule,
  CalendarDay,
  ScheduleBlock,
  DayOfWeek,
  ScheduleAppointmentRequest,
  ScheduleAppointmentResponse,
} from "../../types/InterviewTypes";
import {
  convertToMexicoCityTime,
  formatConfirmedDateTime,
  formatDateInMexicoCityTime,
} from "../../utils/DateTimeUtils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const slideInVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

const DAY_NAMES: Record<number, DayOfWeek> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export function InterviewSchedulingPage() {
  const [searchParams] = useSearchParams();
  //const navigate = useNavigate();
  const toast = useToast();

  // Main states
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserApplication | null>(null);
  const [event, setEvent] = useState<RecruitmentEvent | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(
    null
  );
  const [availableDays, setAvailableDays] = useState<CalendarDay[]>([]);

  // Calendar and selection states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<ScheduleAppointmentResponse | null>(null);

  // Loading states
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // Phrases for the loading
  const loadingPhrases = [
    "Preparando tu experiencia...",
    "Tu camino en la IA comienza aquí",
    "Construyendo el futuro juntos",
    "La innovación te está esperando",
    "Cada gran historia tiene un inicio",
    "Bienvenido a tu nueva aventura",
  ];

  // Get query params from the URL
  const eventId = searchParams.get("event_id") || searchParams.get("event_Id");
  const token = searchParams.get("token");

  // Effect to change the phrases
  useEffect(() => {
    if (isLoading) {
      const phraseInterval = setInterval(() => {
        setCurrentPhraseIndex(
          (prevIndex) => (prevIndex + 1) % loadingPhrases.length
        );
      }, 2000);

      return () => clearInterval(phraseInterval);
    }
  }, [isLoading, loadingPhrases.length]);

  useEffect(() => {
    if (!eventId || !token) {
      toast.error({
        title: "Error de acceso",
        message:
          "Los parámetros de la URL son inválidos. Por favor verifica el enlace.",
      });
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);

      try {
        const apiURL = import.meta.env.VITE_API_URL;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [userResponse, eventResponse, schedulesResponse] =
          await Promise.all([
            fetch(`${apiURL}/api/v1/applications/me`, { headers }),
            fetch(`${apiURL}/api/v1/recruitment-event/${eventId}`, { headers }),
            fetch(`${apiURL}/api/v1/schedules/available`, { headers }),
          ]);

        // Manage user response
        if (userResponse.status === 409) {
          toast.error({
            title: "Ya tienes una cita agendada",
            message:
              "Ya tienes una entrevista programada para este evento de reclutamiento.",
          });
          return;
        } else if (!userResponse.ok) {
          throw new Error(
            `Error al obtener datos del usuario: ${userResponse.status}`
          );
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Manage event response
        if (!eventResponse.ok) {
          throw new Error(
            `Error al obtener datos del evento: ${eventResponse.status}`
          );
        }
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Manage Schedules response
        if (!schedulesResponse.ok) {
          throw new Error(
            `Error al obtener horarios: ${schedulesResponse.status}`
          );
        }
        const schedulesData = await schedulesResponse.json();
        setWeeklySchedule(schedulesData);

        // Generate available days for the calendar
        generateAvailableDays(eventData, schedulesData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error({
          title: "Error al cargar datos",
          message:
            "Hubo un problema al obtener la información. Por favor intenta de nuevo.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [eventId, token]); // toast is intentionally omitted to avoid loops

  const generateAvailableDays = (
    eventData: RecruitmentEvent,
    schedulesData: WeeklySchedule
  ) => {
    // Convert dates to Mexico City time
    const startDate = convertToMexicoCityTime(new Date(eventData.start_date));
    const endDate = convertToMexicoCityTime(new Date(eventData.end_date));
    const days: CalendarDay[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = DAY_NAMES[currentDate.getDay()];
      const daySchedules = schedulesData[dayOfWeek] || [];

      // Filter schedules based on the start date and time
      const filteredSchedules = filterSchedulesByDateTime(
        currentDate,
        startDate,
        daySchedules
      );

      days.push({
        date: new Date(currentDate),
        dayOfWeek,
        hasAvailability: filteredSchedules.length > 0,
        schedules: filteredSchedules,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailableDays(days);
  };

  // Function to filter schedules based on date and time
  const filterSchedulesByDateTime = (
    currentDate: Date,
    startDateTime: Date,
    schedules: ScheduleBlock[]
  ): ScheduleBlock[] => {
    if (currentDate.toDateString() !== startDateTime.toDateString()) {
      return schedules;
    }

    const startTimeString = startDateTime.toTimeString().substring(0, 8); // formato HH:MM:SS

    const filteredSchedules = schedules.filter((schedule) => {
      const isAfterStartTime = schedule.start_time >= startTimeString;

      return isAfterStartTime;
    });

    return filteredSchedules;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedScheduleId(null);
  };

  const handleScheduleSelect = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedScheduleId || !token) return;

    setIsConfirming(true);

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const requestBody: ScheduleAppointmentRequest = {
        schedule_catalog_id: selectedScheduleId,
        date: selectedDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
      };

      const response = await fetch(
        `${apiURL}/api/v1/interview_appointment/schedule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        let errorMessage = "Ocurrió un error inesperado.";

        switch (response.status) {
          case 400:
            errorMessage = "La fecha y hora seleccionadas son inválidas.";
            break;
          case 409:
            errorMessage =
              "El horario que intentas agendar ya fue ocupado por otra persona.";
            break;
          case 412:
            errorMessage = "Ya tienes una entrevista agendada.";
            break;
          case 422:
            errorMessage = "Los datos de tu aplicación son inválidos.";
            break;
          case 500:
            errorMessage = "Ocurrió un error en el servidor.";
            break;
        }

        throw new Error(errorMessage);
      }

      const appointmentData: ScheduleAppointmentResponse =
        await response.json();
      setConfirmedAppointment(appointmentData);
      setAppointmentConfirmed(true);

      toast.success({
        title: "¡Entrevista agendada exitosamente!",
        message: "Tu cita ha sido confirmada. Revisa los detalles abajo.",
      });
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      toast.error({
        title: "Error al agendar",
        message:
          error instanceof Error
            ? error.message
            : "Hubo un problema al agendar tu entrevista.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const getSelectedDaySchedules = (): ScheduleBlock[] => {
    if (!selectedDate || !weeklySchedule || !event) return [];

    const availableDay = availableDays.find(
      (day) => day.date.toDateString() === selectedDate.toDateString()
    );

    return availableDay ? availableDay.schedules : [];
  };

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col items-center justify-center min-h-screen py-16 px-4 overflow-hidden">
        {/* Dynamic background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circles */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-siafi-primary opacity-5 rounded-full animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-siafi-accent opacity-5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-20 left-20 w-32 h-32 bg-siafi-secondary opacity-5 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Medium floating circles */}
          <div
            className="absolute top-1/3 right-1/4 w-24 h-24 bg-siafi-primary opacity-4 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-siafi-accent opacity-6 rounded-full animate-float"
            style={{ animationDelay: "3.5s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/3 w-16 h-16 bg-siafi-secondary opacity-4 rounded-full animate-float"
            style={{ animationDelay: "1.8s" }}
          ></div>

          {/* Small scattered circles */}
          <div
            className="absolute top-1/4 left-1/2 w-8 h-8 bg-siafi-primary opacity-8 rounded-full animate-bounce-slow"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="absolute top-2/3 right-1/6 w-6 h-6 bg-siafi-accent opacity-10 rounded-full animate-bounce-slow"
            style={{ animationDelay: "2.2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/6 w-10 h-10 bg-siafi-secondary opacity-6 rounded-full animate-bounce-slow"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-1/6 right-2/3 w-4 h-4 bg-siafi-primary opacity-12 rounded-full animate-bounce-slow"
            style={{ animationDelay: "4s" }}
          ></div>

          {/* Geometric shapes */}
          <div
            className="absolute top-1/2 left-1/12 w-12 h-12 bg-siafi-accent opacity-4 transform rotate-45 animate-rotate-slow"
            style={{ animationDelay: "2.8s" }}
          ></div>
          <div
            className="absolute bottom-1/6 right-1/12 w-8 h-8 bg-siafi-primary opacity-6 transform rotate-45 animate-rotate-slow"
            style={{ animationDelay: "1.2s" }}
          ></div>
          <div
            className="absolute top-1/12 left-1/3 w-6 h-6 bg-siafi-secondary opacity-8 transform rotate-45 animate-rotate-slow"
            style={{ animationDelay: "3.2s" }}
          ></div>

          {/* Triangular elements */}
          <div
            className="absolute top-1/3 left-1/12 w-0 h-0 border-l-8 border-r-8 border-b-14 border-l-transparent border-r-transparent border-b-siafi-primary opacity-6 animate-float"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/12 w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-siafi-accent opacity-8 animate-float"
            style={{ animationDelay: "1.7s" }}
          ></div>

          {/* Additional tech elements */}
          <div
            className="absolute top-2/3 left-2/3 w-14 h-1 bg-gradient-to-r from-siafi-primary to-transparent opacity-8 animate-pulse"
            style={{ animationDelay: "3.8s" }}
          ></div>
          <div
            className="absolute top-1/4 right-1/8 w-1 h-16 bg-gradient-to-b from-siafi-accent to-transparent opacity-6 animate-pulse"
            style={{ animationDelay: "2.3s" }}
          ></div>
          <div
            className="absolute bottom-1/2 left-1/8 w-12 h-1 bg-gradient-to-r from-siafi-secondary to-transparent opacity-8 animate-pulse"
            style={{ animationDelay: "4.2s" }}
          ></div>

          {/* Micro points */}
          <div
            className="absolute top-1/5 left-3/4 w-2 h-2 bg-siafi-primary opacity-15 rounded-full animate-twinkle"
            style={{ animationDelay: "0.8s" }}
          ></div>
          <div
            className="absolute top-3/5 right-3/4 w-1 h-1 bg-siafi-accent opacity-20 rounded-full animate-twinkle"
            style={{ animationDelay: "1.9s" }}
          ></div>
          <div
            className="absolute bottom-1/5 left-2/3 w-3 h-3 bg-siafi-secondary opacity-12 rounded-full animate-twinkle"
            style={{ animationDelay: "3.1s" }}
          ></div>
          <div
            className="absolute top-4/5 right-1/4 w-1 h-1 bg-siafi-primary opacity-25 rounded-full animate-twinkle"
            style={{ animationDelay: "2.7s" }}
          ></div>
          <div
            className="absolute top-1/8 left-1/8 w-2 h-2 bg-siafi-accent opacity-18 rounded-full animate-twinkle"
            style={{ animationDelay: "4.5s" }}
          ></div>

          {/* Additional tech elements */}
          <div
            className="absolute top-1/3 right-1/6 w-16 h-16 border-2 border-siafi-primary opacity-4 rounded-full animate-float"
            style={{ animationDelay: "3.3s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/5 w-12 h-12 border border-siafi-accent opacity-6 animate-rotate-slow"
            style={{ animationDelay: "2.1s" }}
          ></div>
          <div
            className="absolute top-1/6 left-2/3 w-8 h-8 border-2 border-siafi-secondary opacity-5 transform rotate-45 animate-pulse"
            style={{ animationDelay: "1.4s" }}
          ></div>

          {/* Connection elements */}
          <div
            className="absolute top-1/2 left-1/4 w-20 h-0.5 bg-gradient-to-r from-transparent via-siafi-primary to-transparent opacity-6 animate-pulse"
            style={{ animationDelay: "2.9s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/3 w-0.5 h-24 bg-gradient-to-b from-transparent via-siafi-accent to-transparent opacity-4 animate-pulse"
            style={{ animationDelay: "1.6s" }}
          ></div>

          {/* More scattered points */}
          <div
            className="absolute top-1/12 right-1/3 w-1 h-1 bg-siafi-primary opacity-30 rounded-full animate-twinkle"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute top-5/6 left-1/4 w-2 h-2 bg-siafi-accent opacity-20 rounded-full animate-twinkle"
            style={{ animationDelay: "3.7s" }}
          ></div>
          <div
            className="absolute bottom-1/12 right-2/3 w-1 h-1 bg-siafi-secondary opacity-35 rounded-full animate-twinkle"
            style={{ animationDelay: "2.4s" }}
          ></div>
          <div
            className="absolute top-2/5 left-1/6 w-1 h-1 bg-siafi-primary opacity-40 rounded-full animate-twinkle"
            style={{ animationDelay: "4.1s" }}
          ></div>

          {/* Hexagonal elements */}
          <div
            className="absolute top-1/4 left-3/4 w-6 h-6 bg-siafi-accent opacity-5 transform rotate-12 animate-rotate-slow hexagon"
            style={{ animationDelay: "3.6s" }}
          ></div>
          <div
            className="absolute bottom-1/2 right-1/5 w-4 h-4 bg-siafi-primary opacity-7 transform -rotate-12 animate-rotate-slow hexagon"
            style={{ animationDelay: "1.3s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center max-w-lg mx-auto">
          {/* Logo with improved effects */}
          <div className="mb-12 transform">
            <div className="relative flex justify-center">
              <div className="relative bg-white rounded-full p-4 shadow-xl border border-gray-100">
                <img
                  src={SiafiLogoPng}
                  alt="Logo de SIAFI"
                  className="w-80 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Phrases with animation */}
          <div className="h-20 flex items-center justify-center mb-8">
            <div className="relative">
              <h2
                key={currentPhraseIndex}
                className="text-2xl text-gray-800 font-semibold px-6 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg animate-fade-in"
              >
                {loadingPhrases[currentPhraseIndex]}
              </h2>
              {/* Phrase progress indicator */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-siafi-primary to-siafi-accent rounded-full"></div>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-3 mb-8">
            {loadingPhrases.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPhraseIndex
                    ? "bg-siafi-primary scale-125"
                    : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>

          {/* Subtle message */}
          <div className="text-gray-500 text-sm font-light">
            Configurando tu experiencia personalizada...
          </div>
        </div>
      </div>
    );
  }

  if (!user || !event || !weeklySchedule) {
    return (
      <div className="bg-siafi-surface flex flex-col items-center justify-center min-h-screen py-16 px-4">
        <div className="text-center max-w-md flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-siafi-h3 text-siafi-on-surface mb-2">
            Error al cargar
          </h2>
          <p className="text-siafi-body text-gray-600 mb-6">
            No se pudieron cargar los datos necesarios. Por favor verifica tu
            enlace e intenta de nuevo.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (appointmentConfirmed && confirmedAppointment) {
    return (
      <motion.div
        className="bg-siafi-surface flex flex-col items-center justify-center min-h-screen py-16 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full max-w-5xl text-center">
          <motion.div
            className="flex justify-center mb-6"
            variants={itemVariants}
          >
            <SiafiLogo />
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="text-green-500 mb-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <h1 className="text-siafi-h2 text-siafi-on-surface mb-3">
              ¡Tu entrevista está confirmada!
            </h1>
            <p className="text-siafi-body text-gray-600 mb-8">
              Te esperamos en la fecha y hora elegidas.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-siafi-h4 text-siafi-on-surface mb-4 flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 text-siafi-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Detalles de tu cita
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-siafi-body text-gray-600 font-medium">
                    Candidato:
                  </span>
                  <span className="text-siafi-body text-gray-800">
                    {user.name} {user.lastname}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-siafi-body text-gray-600 font-medium">
                    Fecha y hora:
                  </span>
                  <span className="text-siafi-body text-gray-800 font-semibold">
                    {formatConfirmedDateTime(
                      confirmedAppointment.date_and_time
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-siafi-body text-gray-600 font-medium">
                    Evento:
                  </span>
                  <span className="text-siafi-body text-gray-800">
                    {event.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-siafi-body text-gray-600 font-medium">
                    Duración:
                  </span>
                  <span className="text-siafi-body text-gray-800">
                    20 minutos
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center text-siafi-caption text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Zona horaria: Ciudad de México (CDMX)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-5 my-5 text-left rounded-lg shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-siafi-body text-gray-800 font-semibold mb-2 mt-1">
                    <b>Confirmación por correo</b>
                  </h4>
                  <p className="text-siafi-body text-gray-700 mb-2">
                    En unos momentos recibirás un correo con todos los detalles
                    y el enlace de Google Meet para tu entrevista.
                  </p>
                  <p className="text-siafi-caption text-green-700">
                    Revisa tu bandeja de entrada y la carpeta de spam.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 my-5 text-left rounded-lg shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-siafi-body text-gray-800 font-semibold mb-3 mt-1">
                    <b>Prepárate para tu entrevista</b>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-siafi-body text-gray-700">
                        Prueba tu cámara, micrófono e internet unos minutos
                        antes.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-siafi-body text-gray-700">
                        Busca un lugar con buena iluminación y sin ruido.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-siafi-body text-gray-700">
                        Si postulaste al núcleo de proyectos o capacitación, ten
                        preparado tu GitHub, portafolio o algún proyecto del que
                        quieras platicarnos.
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-md">
                    <p className="text-siafi-caption text-blue-800 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      La entrevista es breve y relajada: queremos conocerte.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-siafi-primary/5 to-siafi-accent/5 rounded-lg border border-siafi-primary/20">
              <div className="text-center">
                <h4 className="text-siafi-body text-gray-800 font-semibold mb-2 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 text-siafi-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <b>Tu camino en la IA comienza aquí</b>
                </h4>
                <p className="text-siafi-body text-gray-700">
                  ¡Gracias por tu interés en <strong>SIAFI</strong>! Nos
                  emociona conocerte y descubrir tus ideas y proyectos. ¡Te
                  esperamos!
                </p>
              </div>
            </div>
            {/*
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/reclutamiento")}
              className="mb-4"
            >
              Volver al inicio
            </Button>
            */}
          </motion.div>
        </div>

        <motion.div
          className="w-full max-w-6xl mx-auto pt-20"
          variants={itemVariants}
        >
          <Footer />
        </motion.div>

        <NotificationContainer position="top-right" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-siafi-surface flex flex-col min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="w-full max-w-6xl mx-auto">
        <motion.div
          className="flex justify-center mb-12"
          variants={itemVariants}
        >
          <SiafiLogo />
        </motion.div>

        <motion.div className="text-center mb-10" variants={itemVariants}>
          <h1 className="text-siafi-h2 text-siafi-on-surface mb-4">
            Agendar entrevista
          </h1>
          <p className="text-siafi-body text-gray-600 mb-6 w-full md:w-1/2 mx-auto">
            ¡Hola{" "}
            <b>
              {user.name} {user.lastname}
            </b>
            !
            <br />
            Estamos muy contentos de que hayas pasado a la siguiente fase del
            procesor de reclutamiento y quieras formar parte de SIAFI.
            <br />
            <br />
            Por favor, selecciona la fecha y hora que mejor se acomoden a tu
            disponibilidad para tu entrevista de reclutamiento.
          </p>
          {/* Información del evento en formato tarjeta */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-siafi-body text-blue-800 font-semibold mb-3">
                  Información del evento
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-siafi-body text-blue-700 font-medium">
                      Evento:
                    </span>
                    <span className="text-siafi-body text-blue-800 font-semibold">
                      {event.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-siafi-body text-blue-700 font-medium">
                      Fechas disponibles:
                    </span>
                    <span className="text-siafi-caption text-blue-800">
                      {formatDateInMexicoCityTime(new Date(event.start_date), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {formatDateInMexicoCityTime(new Date(event.end_date), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-siafi-body text-blue-700 font-medium">
                      Duración:
                    </span>
                    <span className="text-siafi-caption text-blue-800">
                      15-20 minutos
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-center text-siafi-caption text-blue-600">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-bold">
                        Todos los horarios en hora de la Ciudad de México (CDMX)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instrucciones mejoradas */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-12 max-w-5xl mx-auto"
          variants={itemVariants}
        >
          <div className="text-center mb-8">
            <h2 className="text-siafi-h3 text-siafi-on-surface mb-3 flex items-center justify-center">
              <svg
                className="w-6 h-6 mr-3 text-siafi-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Cómo agendar tu entrevista
            </h2>
            <p className="text-siafi-body text-gray-600">
              Sigue estos sencillos pasos para reservar tu cita
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                    <b>1</b>
                  </div>
                </div>
                <div>
                  <h3 className="text-siafi-body text-gray-800 font-semibold mb-2 mt-1">
                    <b>Selecciona una fecha</b>
                  </h3>
                  <p className="text-siafi-body text-gray-700 mb-2">
                    Elige una fecha disponible en el calendario de la izquierda.
                  </p>
                  <p className="text-siafi-caption text-green-700">
                    Las fechas activas aparecerán resaltadas en azul.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    <b>2</b>
                  </div>
                </div>
                <div>
                  <h3 className="text-siafi-body text-gray-800 font-semibold mb-2 mt-1">
                    <b>Elige un horario</b>
                  </h3>
                  <p className="text-siafi-body text-gray-700 mb-2">
                    Selecciona el horario que mejor se acomode a tu
                    disponibilidad.
                  </p>
                  <p className="text-siafi-caption text-blue-700">
                    Duración aproximada: 15-20 minutos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                    <b>3</b>
                  </div>
                </div>
                <div>
                  <h3 className="text-siafi-body text-gray-800 font-semibold mb-2 mt-1">
                    <b>Confirma tu cita</b>
                  </h3>
                  <p className="text-siafi-body text-gray-700 mb-2">
                    Haz clic en "Confirmar entrevista" para reservar tu lugar.
                  </p>
                  <p className="text-siafi-caption text-purple-700">
                    Recibirás un correo de confirmación con todos los detalles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-semibold">
                    <b>4</b>
                  </div>
                </div>
                <div>
                  <h3 className="text-siafi-body text-gray-800 font-semibold mb-2 mt-1">
                    <b>¡Prepárate!</b>
                  </h3>
                  <p className="text-siafi-body text-gray-700 mb-2">
                    Prepárate para contarnos sobre ti y tus proyectos.
                  </p>
                  <p className="text-siafi-caption text-amber-700">
                    La entrevista es relajada, ¡solo queremos conocerte!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8"
          variants={itemVariants}
        >
          {/* Calendario */}
          <motion.div variants={slideInVariants}>
            <h2 className="text-siafi-h3 text-siafi-on-surface mb-4">
              Selecciona una fecha
            </h2>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              availableDays={availableDays}
              minDate={new Date(event.start_date)}
              maxDate={new Date(event.end_date)}
            />
          </motion.div>

          {/* Horarios */}
          <motion.div variants={slideInVariants}>
            <h2 className="text-siafi-h3 text-siafi-on-surface mb-4">
              Selecciona un horario
            </h2>
            {selectedDate ? (
              <TimeSlots
                selectedDate={selectedDate}
                schedules={getSelectedDaySchedules()}
                selectedScheduleId={selectedScheduleId}
                onScheduleSelect={handleScheduleSelect}
                onConfirm={handleConfirmAppointment}
                isConfirming={isConfirming}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="text-gray-400">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-siafi-body text-gray-800 font-semibold mb-2">
                  Selecciona una fecha primero
                </h3>
                <p className="text-siafi-body text-gray-600 mb-3">
                  Elige una fecha disponible en el calendario para ver los
                  horarios
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Los horarios aparecerán aquí
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Botón de regreso */}
        {/*
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => navigate("/reclutamiento")}
            disabled={isConfirming}
          >
            Volver al inicio
          </Button>
        </div>
        */}
      </div>

      <motion.div
        className="w-full max-w-6xl mx-auto pt-20"
        variants={itemVariants}
      >
        <Footer />
      </motion.div>

      <NotificationContainer position="top-right" />
    </motion.div>
  );
}
