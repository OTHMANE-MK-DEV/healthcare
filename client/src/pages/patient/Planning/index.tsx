import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types for our data
interface Doctor {
  _id: string;
  nom: string;
  prenom: string;
  specialite: string;
  experience: number;
}

interface AvailableSlot {
  _id: string;
  datetime: string;
  slotDuration: number;
  isBooked: boolean;
  medecin: string | Doctor;
}

interface BookingState {
  selectedDate: string | null;
  selectedDoctor: string | null;
  selectedTime: string | null;
  motif: string;
  step: 'calendar' | 'doctor' | 'time' | 'motif' | 'confirmation';
}

// API service functions
const apiService = {
  // Get all doctors
  async getDoctors(): Promise<Doctor[]> {
    const response = await fetch('http://localhost:5001/api/doctors');
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  },

  // Get available slots for a doctor on a specific date
  async getDoctorSlots(doctorId: string, date: string): Promise<AvailableSlot[]> {
    const response = await fetch(`http://localhost:5001/api/available-slots/doctor/${doctorId}?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch available slots');
    return response.json();
  },

  // Create a booking
  async createBooking(bookingData: {
    doctorId: string;
    datetime: string;
    motif: string;
    patientId: string; // You'll need to get this from your auth context
    slotId: string;
  }) {
    const response = await fetch('http://localhost:5001/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create booking');
    }
    
    return response.json();
  }
};


const getPatientIdFromStorage = (): string | null => {
  try {
    const userData = localStorage.getItem('profile');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user._id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export default function Planning() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, AvailableSlot[]>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'slots'>('name');
  
  const [booking, setBooking] = useState<BookingState>({
    selectedDate: null,
    selectedDoctor: null,
    selectedTime: null,
    motif: '',
    step: 'calendar',
  });
  
  const [showDialog, setShowDialog] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const today = new Date();

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const doctorsData = await apiService.getDoctors();
        setDoctors(doctorsData);
        console.log(doctorsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  

  // Fetch availability for a specific doctor and date
  const fetchAvailability = async (doctorId: string, date: string) => {
    const cacheKey = `${doctorId}-${date}`;
    
    // Return cached data if available
    if (availabilityCache[cacheKey]) {
      return availabilityCache[cacheKey];
    }

    try {
      const slots = await apiService.getDoctorSlots(doctorId, date);
      
      // Update cache
      setAvailabilityCache(prev => ({
        ...prev,
        [cacheKey]: slots
      }));
      
      return slots;
    } catch (err) {
      console.error('Error fetching availability:', err);
      return [];
    }
  };

  // Get availability for all doctors on a specific date
  const getAvailabilityForDate = async (date: Date): Promise<Record<string, AvailableSlot[]>> => {
    const dateStr = formatDate(date);
    const availability: Record<string, AvailableSlot[]> = {};

    // Fetch availability for each doctor in parallel
    const promises = doctors.map(async (doctor) => {
      const slots = await fetchAvailability(doctor._id, dateStr);
      availability[doctor._id] = slots;
    });

    await Promise.all(promises);
    return availability;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).slice(0, 5); // Get HH:MM format
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const [dateAvailability, setDateAvailability] = useState<Record<string, Record<string, AvailableSlot[]>>>({});

  // Pre-fetch availability for visible month
  useEffect(() => {
    const prefetchAvailability = async () => {
      const monthAvailability: Record<string, Record<string, AvailableSlot[]>> = {};
      
      for (const day of days) {
        if (day && !isDatePast(day)) {
          const dateStr = formatDate(day);
          monthAvailability[dateStr] = await getAvailabilityForDate(day);
        }
      }
      
      setDateAvailability(monthAvailability);
    };

    if (doctors.length > 0) {
      prefetchAvailability();
    }
  }, [days, doctors]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = async (date: Date) => {
    if (isDatePast(date)) return;
    
    const dateStr = formatDate(date);
    const availability = dateAvailability[dateStr] || await getAvailabilityForDate(date);
    
    // Check if any doctor has availability for this date
    const hasAnyAvailability = Object.values(availability).some(slots => 
      slots.filter(slot => !slot.isBooked).length > 0
    );
    
    if (!hasAnyAvailability) return;

    // Update dateAvailability with fetched data
    if (!dateAvailability[dateStr]) {
      setDateAvailability(prev => ({
        ...prev,
        [dateStr]: availability
      }));
    }

    setBooking({
      ...booking,
      selectedDate: dateStr,
      selectedDoctor: null,
      selectedTime: null,
      step: 'doctor',
    });
    setShowDialog(true);
  };

  const handleDoctorSelect = async (doctorId: string) => {
    if (!booking.selectedDate) return;
    
    // Ensure we have the latest availability data
    let availability = dateAvailability[booking.selectedDate]?.[doctorId];
    if (!availability) {
      availability = await fetchAvailability(doctorId, booking.selectedDate);
    }

    const availableSlots = availability.filter(slot => !slot.isBooked);
    
    if (availableSlots.length === 0) return;

    setBooking({
      ...booking,
      selectedDoctor: doctorId,
      selectedTime: null,
      step: 'time',
    });
  };

  const handleTimeSelect = (time: string) => {
  setBooking({
    ...booking,
    selectedTime: time,
    step: 'motif',
  });
};

  const handleMotifSubmit = async () => {
    if (!booking.motif.trim() || !booking.selectedDoctor || !booking.selectedDate || !booking.selectedTime) return;
    
    const patientId = getPatientIdFromStorage();
    if (!patientId) {
      setBookingStatus('error');
      setError('Please log in to book an appointment');
      return;
    }

    setBooking({ ...booking, step: 'confirmation' });
    
    try {
      // Create datetime string from selected date and time
      const datetime = `${booking.selectedDate}T${booking.selectedTime}:00`;
      
      await apiService.createBooking({
        doctorId: booking.selectedDoctor,
        datetime,
        motif: booking.motif,
        patientId: patientId
      });
      
      setBookingStatus('success');
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus('error');
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    if (bookingStatus === 'success') {
      setBooking({
        selectedDate: null,
        selectedDoctor: null,
        selectedTime: null,
        motif: '',
        step: 'calendar',
      });
      setBookingStatus('pending');
      
      // Clear cache for the booked date to reflect changes
      if (booking.selectedDate) {
        setAvailabilityCache(prev => {
          const newCache = { ...prev };
          Object.keys(newCache).forEach(key => {
            if (key.includes(booking.selectedDate!)) {
              delete newCache[key];
            }
          });
          return newCache;
        });
      }
    }
  };

  const getSelectedDoctor = () => {
    return doctors.find(doctor => doctor._id === booking.selectedDoctor);
  };

const getAvailabilityForSelectedDoctor = () => {
  if (!booking.selectedDate || !booking.selectedDoctor) return [];
  
  const availability = dateAvailability[booking.selectedDate]?.[booking.selectedDoctor] || [];
  
  // Return slots with time and availability status
  return availability.map(slot => ({
    datetime: slot.datetime,
    time: formatTime(slot.datetime),
    isBooked: slot.isBooked
  }));
};

  const getAvailableDoctorsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    const availability = dateAvailability[dateStr];
    
    if (!availability) return [];
    
    return doctors.filter(doctor => {
      const doctorSlots = availability[doctor._id] || [];
      return doctorSlots.filter(slot => !slot.isBooked).length > 0;
    });
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Add this computed value after your state declarations
// Update the filteredDoctors computation to handle undefined values safely
const filteredDoctors = useMemo(() => {
  const filtered = doctors.filter(doctor => {
    // Handle cases where doctor properties might be undefined or null
    const doctorName = `${doctor.prenom || ''} ${doctor.nom || ''}`.toLowerCase();
    const doctorSpecialty = (doctor.specialite || '').toLowerCase();
    const searchTermLower = (searchTerm || '').toLowerCase();
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      doctorName.includes(searchTermLower) ||
      doctorSpecialty.includes(searchTermLower);
    
    // Filter by specialty
    const matchesSpecialty = selectedSpecialty === '' || doctor.specialite === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  // Sort doctors
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const nameA = `${a.prenom || ''} ${a.nom || ''}`;
        const nameB = `${b.prenom || ''} ${b.nom || ''}`;
        return nameA.localeCompare(nameB);
      case 'experience':
        return (b.experience || 0) - (a.experience || 0);
      case 'slots':
        const aSlots = dateAvailability[booking.selectedDate || '']?.[a._id]?.filter(slot => !slot.isBooked).length || 0;
        const bSlots = dateAvailability[booking.selectedDate || '']?.[b._id]?.filter(slot => !slot.isBooked).length || 0;
        return bSlots - aSlots;
      default:
        return 0;
    }
  });

  return filtered;
}, [doctors, searchTerm, selectedSpecialty, sortBy, dateAvailability, booking.selectedDate]);

  useEffect(() => {
    if (!showDialog) {
      setSearchTerm('');
      setSelectedSpecialty('');
      setSortBy('name');
    }
  }, [showDialog]);

  if (loading) {
    return (
      <div className="min-h-full w-full p-2 md:p-8 overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full w-full p-2 md:p-8 overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full p-2 md:p-8 overflow-x-hidden">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Book an Appointment
          </h1>
          <p className="text-slate-600">
            Select an available date to schedule your appointment with a doctor
          </p>
        </div>

        {/* Calendar Card */}
        <div className="bg-white w-2/5 max-xl:w-3/5 max-lg:w-full mx-auto rounded-2xl shadow-lg p-6 md:p-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lime-600" />
              <h2 className="text-xl font-semibold text-slate-800">{monthYear}</h2>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-lime-500 to-lime-600 rounded"></div>
              <span className="text-sm text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded"></div>
              <span className="text-sm text-slate-600">Limited Slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-200 rounded"></div>
              <span className="text-sm text-slate-600">Unavailable</span>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-slate-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isPast = isDatePast(day);
              const availableDoctors = getAvailableDoctorsForDate(day);
              const hasAnyAvailability = availableDoctors.length > 0;
              const isLimited = hasAnyAvailability && availableDoctors.length <= 2;
              const isSelected = booking.selectedDate === formatDate(day);

              let buttonClasses = 'w-full aspect-square rounded-xl font-medium transition-all duration-200 ';
              
              if (isPast) {
                buttonClasses += 'bg-slate-100 text-slate-400 cursor-not-allowed';
              } else if (!hasAnyAvailability) {
                buttonClasses += 'bg-slate-200 text-slate-500 cursor-not-allowed';
              } else if (isSelected) {
                buttonClasses += 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-lg scale-105';
              } else if (isLimited) {
                buttonClasses += 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:shadow-md hover:scale-105 cursor-pointer';
              } else {
                buttonClasses += 'bg-gradient-to-r from-lime-500 to-lime-600 text-white hover:from-lime-600 hover:to-lime-700 hover:shadow-md hover:scale-105 cursor-pointer';
              }

              return (
                <button
                  key={index}
                  onClick={() => !isPast && hasAnyAvailability && handleDateClick(day)}
                  disabled={isPast || !hasAnyAvailability}
                  className={buttonClasses}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-lg">{day.getDate()}</span>
                    {hasAnyAvailability && !isPast && (
                      <span className="text-xs opacity-90 mt-1 max-sm:hidden">
                        {availableDoctors.length} doctors
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent className="max-w-lg">
            {/* Doctor Selection Step */}
            {booking.step === 'doctor' && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-lime-600" />
                    Select a Doctor
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Choose a doctor for your appointment on{' '}
                    {booking.selectedDate && new Date(booking.selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Search and Filter Section */}
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search doctors by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>

                  {/* Filters Row */}
                  <div className="flex gap-2">
                    {/* Specialty Filter */}
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Specialties</option>
                      {Array.from(new Set(doctors.map(d => d.specialite))).map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>

                    {/* Sort Filter */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'experience' | 'slots')}
                      className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="experience">Sort by Experience</option>
                      <option value="slots">Sort by Available Slots</option>
                    </select>
                  </div>
                </div>

                {/* Doctors List */}
                <div className="space-y-3 py-4 max-h-96 overflow-y-auto px-2">
                  {filteredDoctors.map((doctor) => {
                    if (!booking.selectedDate) return null;
                    
                    const availability = dateAvailability[booking.selectedDate]?.[doctor._id] || [];
                    const availableSlots = availability.filter(slot => !slot.isBooked);
                    const isAvailable = availableSlots.length > 0;

                    return (
                      <button
                        key={doctor._id}
                        onClick={() => isAvailable && handleDoctorSelect(doctor._id)}
                        disabled={!isAvailable}
                        className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                          isAvailable
                            ? 'border-lime-200 bg-lime-50 hover:bg-lime-100 hover:border-lime-300 cursor-pointer'
                            : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              Dr. {doctor.prenom} {doctor.nom}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {doctor.specialite} • {doctor.experience} years experience
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              isAvailable ? 'text-lime-600' : 'text-slate-400'
                            }`}>
                              {isAvailable ? `${availableSlots.length} slots` : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {filteredDoctors.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No doctors found matching your criteria
                    </div>
                  )}
                </div>

                <AlertDialogFooter>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </AlertDialogFooter>
              </>
            )}

            {/* Time Selection Step */}
            {booking.step === 'time' && (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-lime-600" />
        Select a Time Slot
      </AlertDialogTitle>
      <AlertDialogDescription>
        Available appointments with{' '}
        <span className="font-semibold">
          Dr. {getSelectedDoctor()?.prenom} {getSelectedDoctor()?.nom}
        </span>{' '}
        on{' '}
        {booking.selectedDate && new Date(booking.selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="grid grid-cols-3 gap-3 py-4">
      {getAvailabilityForSelectedDoctor().map((slot) => {
        const isAvailable = !slot.isBooked;
        
        return (
          <button
            key={slot.datetime}
            onClick={() => isAvailable && handleTimeSelect(slot.time)}
            disabled={!isAvailable}
            className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isAvailable
                ? 'bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-sm hover:shadow-md cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {slot.time}
            {!isAvailable && (
              <div className="text-xs mt-1 opacity-75">Booked</div>
            )}
          </button>
        );
      })}
    </div>

    <AlertDialogFooter>
      <Button 
        variant="outline" 
        onClick={() => setBooking({ ...booking, step: 'doctor' })}
      >
        Back
      </Button>
    </AlertDialogFooter>
  </>
)}

            {/* Motif Step */}
            {booking.step === 'motif' && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-lime-600" />
                    Appointment Details
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Please provide the reason for your appointment
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                  <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-lime-800 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">
                        Dr. {getSelectedDoctor()?.prenom} {getSelectedDoctor()?.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-lime-800 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-semibold">
                        {booking.selectedDate && new Date(booking.selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-lime-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{booking.selectedTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motif">Reason for Visit *</Label>
                    <Textarea
                      id="motif"
                      placeholder="Please describe your symptoms or reason for consultation..."
                      value={booking.motif}
                      onChange={(e) => setBooking({ ...booking, motif: e.target.value })}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setBooking({ ...booking, step: 'time' })}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleMotifSubmit}
                    disabled={!booking.motif.trim()}
                    className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700"
                  >
                    Confirm Appointment
                  </Button>
                </AlertDialogFooter>
              </>
            )}

            {/* Confirmation Step */}
            {booking.step === 'confirmation' && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    {bookingStatus === 'pending' && (
                      <>
                        <div className="h-5 w-5 border-2 border-lime-600 border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    )}
                    {bookingStatus === 'success' && (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        Appointment Requested!
                      </>
                    )}
                    {bookingStatus === 'error' && (
                      <>
                        <XCircle className="h-6 w-6 text-red-600" />
                        Booking Failed
                      </>
                    )}
                  </AlertDialogTitle>
                </AlertDialogHeader>

                <div className="py-6">
                  {bookingStatus === 'pending' && (
                    <div className="text-center">
                      <p className="text-slate-600">
                        Please wait while we process your appointment request...
                      </p>
                    </div>
                  )}

                  {bookingStatus === 'success' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 mb-3">
                          Your appointment request has been successfully submitted. You will receive a confirmation once the doctor approves your request.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Doctor:</span>
                            <span className="font-semibold text-slate-800">
                              Dr. {getSelectedDoctor()?.prenom} {getSelectedDoctor()?.nom}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Specialty:</span>
                            <span className="font-semibold text-slate-800">
                              {getSelectedDoctor()?.specialite}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Date:</span>
                            <span className="font-semibold text-slate-800">
                              {booking.selectedDate && new Date(booking.selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Time:</span>
                            <span className="font-semibold text-slate-800">{booking.selectedTime}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600">Reason:</span>
                            <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                              {booking.motif}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">
                        You will be notified via email once the doctor confirms your appointment.
                      </p>
                    </div>
                  )}

                  {bookingStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 mb-2">
                        We encountered an error while processing your appointment request. Please try again later.
                      </p>
                      <p className="text-sm text-red-700">
                        If the problem persists, please contact our support team.
                      </p>
                    </div>
                  )}
                </div>

                {bookingStatus !== 'pending' && (
                  <AlertDialogFooter>
                    {bookingStatus === 'error' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBooking({ ...booking, step: 'time' });
                          setBookingStatus('pending');
                        }}
                      >
                        Try Again
                      </Button>
                    )}
                    <Button
                      onClick={handleClose}
                      className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700"
                    >
                      {bookingStatus === 'success' ? 'Done' : 'Close'}
                    </Button>
                  </AlertDialogFooter>
                )}
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}