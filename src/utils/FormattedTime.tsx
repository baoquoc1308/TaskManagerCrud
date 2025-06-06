import React from "react";

interface FormattedTimeProps {
  isoString?: string;
}

const FormattedTime: React.FC<FormattedTimeProps> = ({ isoString }) => {
  if (!isoString) return <span>Invalid date</span>;

  const date = new Date(isoString);

  const vietnamDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);

  const formattedTime = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(vietnamDate);

  const finalTime = formattedTime.replace(/\b(am|pm)\b/, (match) =>
    match.toUpperCase()
  );

  return <span>{finalTime}</span>;
};

export default FormattedTime;
