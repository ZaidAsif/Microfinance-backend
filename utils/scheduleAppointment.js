import dayjs from 'dayjs';
import Appointments from '../models/appointment.js';

export const getNextAvailableSlot = async (userId) => {
  const officeHours = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"];
  let date = dayjs().startOf('day').add(1, 'day'); 

  // Get all appointments for the given user
  while (true) {
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();

    // Check if the user already has an appointment for this day
    const existingAppointment = await Appointments.findOne({
      userId: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    if (existingAppointment) {
      // If user already has an appointment, skip this day
      date = date.add(1, 'day');
      continue;
    }

    const appointments = await Appointments.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    const bookedTimes = new Set(appointments.map(app => app.time));

    for (let time of officeHours) {
      if (!bookedTimes.has(time)) {
        return { date: startOfDay, time };
      }
    }

    date = date.add(1, 'day'); // Move to the next day if all slots are booked
  }
};
