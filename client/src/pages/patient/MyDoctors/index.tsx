import React, { useState } from 'react';
import { Calendar, Clock, User, Star, MapPin, Phone, Mail, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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

// Mock data for doctors the patient has previously met
const myDoctors = [
  {
    _id: '1',
    nom: 'Smith',
    prenom: 'John',
    specialite: 'Cardiology',
    experience: 10,
    lastVisit: '2025-08-15',
    totalVisits: 5,
    rating: 4.8,
    location: 'Medical Center, Floor 3',
    phone: '+1 (555) 123-4567',
    email: 'j.smith@medcenter.com',
    avatar: 'JS'
  },
  {
    _id: '2',
    nom: 'Johnson',
    prenom: 'Emily',
    specialite: 'Dermatology',
    experience: 8,
    lastVisit: '2025-09-22',
    totalVisits: 3,
    rating: 4.9,
    location: 'Skin Care Clinic, Building B',
    phone: '+1 (555) 234-5678',
    email: 'e.johnson@medcenter.com',
    avatar: 'EJ'
  },
  {
    _id: '3',
    nom: 'Brown',
    prenom: 'Michael',
    specialite: 'Pediatrics',
    experience: 12,
    lastVisit: '2025-07-10',
    totalVisits: 8,
    rating: 5.0,
    location: 'Children\'s Health Wing',
    phone: '+1 (555) 345-6789',
    email: 'm.brown@medcenter.com',
    avatar: 'MB'
  },
  {
    _id: '4',
    nom: 'Davis',
    prenom: 'Sarah',
    specialite: 'Neurology',
    experience: 15,
    lastVisit: '2025-09-05',
    totalVisits: 2,
    rating: 4.7,
    location: 'Neurology Department, Floor 5',
    phone: '+1 (555) 456-7890',
    email: 's.davis@medcenter.com',
    avatar: 'SD'
  },
];

// Generate availability for next 14 days
const getAvailabilityForDoctor = (doctorId: string) => {
  const today = new Date(2025, 9, 2); // October 2, 2025
  const availability = [];
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // Skip Sundays
    
    const dateNum = date.getDate() + date.getMonth() * 31;
    const doctorNum = parseInt(doctorId) || 1;
    const seed = (dateNum + doctorNum * 100) % 100;
    
    let slots = [];
    if (seed >= 15) {
      if (seed < 35) {
        slots = ['09:00', '10:00', '14:00'];
      } else if (seed < 60) {
        slots = ['09:00', '10:00', '11:00', '14:00', '15:00'];
      } else {
        slots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      }
    }
    
    if (slots.length > 0) {
      availability.push({
        date: date.toISOString().split('T')[0],
        slots
      });
    }
  }
  
  return availability;
};

interface BookingState {
  doctorId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  motif: string;
  step: 'date' | 'time' | 'motif' | 'confirmation';
}

export default function MyDoctors() {
  const [showDialog, setShowDialog] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    doctorId: null,
    selectedDate: null,
    selectedTime: null,
    motif: '',
    step: 'date',
  });
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const handleBookAppointment = (doctorId: string) => {
    setBooking({
      doctorId,
      selectedDate: null,
      selectedTime: null,
      motif: '',
      step: 'date',
    });
    setShowDialog(true);
  };

  const handleDateSelect = (date: string) => {
    setBooking({
      ...booking,
      selectedDate: date,
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

  const handleMotifSubmit = () => {
    if (!booking.motif.trim()) return;
    
    setBooking({ ...booking, step: 'confirmation' });
    
    setTimeout(() => {
      setBookingStatus(Math.random() > 0.2 ? 'success' : 'error');
    }, 1500);
  };

  const handleClose = () => {
    setShowDialog(false);
    if (bookingStatus === 'success') {
      setBooking({
        doctorId: null,
        selectedDate: null,
        selectedTime: null,
        motif: '',
        step: 'date',
      });
      setBookingStatus('pending');
    }
  };

  const getSelectedDoctor = () => {
    return myDoctors.find(doctor => doctor._id === booking.doctorId);
  };

  const getAvailability = () => {
    if (!booking.doctorId) return [];
    return getAvailabilityForDoctor(booking.doctorId);
  };

  const getSlotsForDate = (date: string) => {
    const availability = getAvailability();
    const dateAvailability = availability.find(a => a.date === date);
    return dateAvailability?.slots || [];
  };

  return (
    <div className="min-h-full w-full p-4 md:p-8 bg-gradient-to-br from-slate-50 to-lime-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            My Doctors
          </h1>
          <p className="text-slate-600">
            Book appointments with doctors you've previously consulted
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
            >
              {/* Doctor Header */}
              <div className="bg-gradient-to-r from-lime-500 to-lime-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {doctor.avatar}
                  </div>
                  {/* <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-white" />
                    <span className="font-semibold">{doctor.rating}</span>
                  </div> */}
                </div>
                <h3 className="text-xl font-bold mb-1">
                  Dr. {doctor.prenom} {doctor.nom}
                </h3>
                <p className="text-lime-50 text-sm">{doctor.specialite}</p>
              </div>

              {/* Doctor Info */}
              <div className="p-6 space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between p-3 bg-lime-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-lime-600">{doctor.totalVisits}</p>
                    <p className="text-xs text-slate-600">Total Visits</p>
                  </div>
                  <div className="w-px h-10 bg-lime-200"></div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(doctor.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-600">Last Visit</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-lime-600 flex-shrink-0" />
                    <span className="truncate">{doctor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-lime-600 flex-shrink-0" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-lime-600 flex-shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  onClick={() => handleBookAppointment(doctor._id)}
                  className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Book Appointment
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Date Selection Step */}
            {booking.step === 'date' && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-lime-600" />
                    Select a Date
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Choose an available date with{' '}
                    <span className="font-semibold">
                      Dr. {getSelectedDoctor()?.prenom} {getSelectedDoctor()?.nom}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAvailability().map((avail) => {
                      const date = new Date(avail.date + 'T00:00:00');
                      const isToday = avail.date === new Date(2025, 9, 2).toISOString().split('T')[0];
                      
                      return (
                        <button
                          key={avail.date}
                          onClick={() => handleDateSelect(avail.date)}
                          className="p-4 rounded-lg border-2 border-lime-200 bg-lime-50 hover:bg-lime-100 hover:border-lime-300 transition-all duration-200 text-left"
                        >
                          <div className="font-semibold text-slate-800">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-2xl font-bold text-lime-600 my-1">
                            {date.getDate()}
                          </div>
                          <div className="text-xs text-slate-600">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-xs text-lime-600 font-medium mt-2">
                            {avail.slots.length} slots
                          </div>
                          {isToday && (
                            <div className="text-xs text-amber-600 font-semibold mt-1">
                              Today
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
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
                    Available appointments on{' '}
                    {booking.selectedDate && new Date(booking.selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-3 gap-3 py-4">
                  {booking.selectedDate && getSlotsForDate(booking.selectedDate).map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {time}
                    </button>
                  ))}
                </div>

                <AlertDialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setBooking({ ...booking, step: 'date' })}
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
                        Appointment Booked!
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
                        Please wait while we process your appointment...
                      </p>
                    </div>
                  )}

                  {bookingStatus === 'success' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 mb-3">
                          Your appointment has been successfully booked with Dr. {getSelectedDoctor()?.prenom} {getSelectedDoctor()?.nom}!
                        </p>
                        <div className="space-y-2 text-sm">
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
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 text-center">
                        You will receive a confirmation email shortly.
                      </p>
                    </div>
                  )}

                  {bookingStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 mb-2">
                        We encountered an error while booking your appointment. Please try again.
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