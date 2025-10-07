import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Function to generate availability dynamically for any date
const getAvailabilityForDate = (date: Date) => {
  const dayOfWeek = date.getDay();
  
  // Skip Sundays (doctor's day off)
  if (dayOfWeek === 0) return [];
  
  // Use date as seed for consistent "random" availability
  const dateNum = date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;
  const seed = dateNum % 100;
  
  // Generate availability based on seed
  if (seed < 15) {
    // 15% chance of no availability (fully booked)
    return [];
  } else if (seed < 35) {
    // 20% chance of limited slots
    return ['09:00', '10:00', '14:00'];
  } else if (seed < 60) {
    // 25% chance of medium availability
    return ['09:00', '10:00', '11:00', '14:00', '15:00'];
  } else {
    // 40% chance of full availability
    return ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  }
};

const allTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface BookingState {
  selectedDate: string | null;
  selectedTime: string | null;
  motif: string;
  step: 'calendar' | 'time' | 'motif' | 'confirmation';
}

export default function Planning() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); // October 2025
  const [booking, setBooking] = useState<BookingState>({
    selectedDate: null,
    selectedTime: null,
    motif: '',
    step: 'calendar',
  });
  const [showDialog, setShowDialog] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const today = new Date(2025, 9, 2); // October 2, 2025

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

  const isDatePast = (date: Date) => {
    return date < today;
  };



  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date)) return;
    
    const availability = getAvailabilityForDate(date);
    if (availability.length === 0) return;

    setBooking({
      ...booking,
      selectedDate: formatDate(date),
      selectedTime: null,
      step: 'time',
    });
    setShowDialog(true);
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
    
    // Simulate API call
    setTimeout(() => {
      setBookingStatus(Math.random() > 0.2 ? 'success' : 'error');
    }, 1500);
  };

  const handleClose = () => {
    setShowDialog(false);
    if (bookingStatus === 'success') {
      setBooking({
        selectedDate: null,
        selectedTime: null,
        motif: '',
        step: 'calendar',
      });
      setBookingStatus('pending');
    }
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-full w-full p-2 md:p-8 overflow-x-hidden">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Book an Appointment
          </h1>
          <p className="text-slate-600">
            Select an available date to schedule your appointment with the doctor
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
              const availability = getAvailabilityForDate(day);
              const hasSlots = availability.length > 0;
              const isLimited = hasSlots && availability.length <= 3;
              const isSelected = booking.selectedDate === formatDate(day);

              let buttonClasses = 'w-full aspect-square rounded-xl font-medium transition-all duration-200 ';
              
              if (isPast) {
                buttonClasses += 'bg-slate-100 text-slate-400 cursor-not-allowed';
              } else if (!hasSlots) {
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
                  onClick={() => !isPast && hasSlots && handleDateClick(day)}
                  disabled={isPast || !hasSlots}
                  className={buttonClasses}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-lg">{day.getDate()}</span>
                    {hasSlots && !isPast && (
                      <span className="text-xs opacity-90 mt-1 max-sm:hidden">
                        {availability.length} slots
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
            {booking.step === 'time' && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-lime-600" />
                    Select a Time Slot
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Available appointments for{' '}
                    {booking.selectedDate && new Date(booking.selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-3 gap-3 py-4">
                  {allTimeSlots.map((time) => {
                    const isAvailable = booking.selectedDate && 
                      getAvailabilityForDate(new Date(booking.selectedDate + 'T00:00:00')).includes(time);

                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && handleTimeSelect(time)}
                        disabled={!isAvailable}
                        className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          isAvailable
                            ? 'bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-sm hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                <AlertDialogFooter>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </AlertDialogFooter>
              </>
            )}

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