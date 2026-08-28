// Client-side validation for the reservation form.
// Returns an object of { field: errorCode } — empty means the form is valid.
// Invalid forms are never sent to the backend.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_PEOPLE = 20;

export function validateReservation(values) {
  const errors = {};

  const name = (values.name || '').trim();
  if (!name) errors.name = 'required';
  else if (name.length < 2) errors.name = 'nameTooShort';

  const email = (values.email || '').trim();
  if (!email) errors.email = 'required';
  else if (!EMAIL_RE.test(email)) errors.email = 'emailInvalid';

  const date = values.date;
  if (!date) {
    errors.date = 'required';
  } else {
    const picked = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(picked.getTime())) errors.date = 'dateInvalid';
    else if (picked < today) errors.date = 'datePast';
  }

  const people = Number(values.people);
  if (values.people === '' || values.people == null || !Number.isInteger(people) || people < 1) {
    errors.people = 'peopleInvalid';
  } else if (people > MAX_PEOPLE) {
    errors.people = 'peopleTooMany';
  }

  return errors;
}
