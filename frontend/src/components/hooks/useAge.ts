export const AgeCalculator = (birthDate: Date) => {
  const today = new Date();
  const birthdateDate = new Date(birthDate);

  let calculatedAge = today.getFullYear() - birthdateDate.getFullYear();
  const monthDiff = today.getMonth() - birthdateDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthdateDate.getDate())
  ) {
    calculatedAge--;
  }
  return calculatedAge;
};
