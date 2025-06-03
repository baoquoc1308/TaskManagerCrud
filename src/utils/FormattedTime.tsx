import React from "react";

interface FormattedTimeProps {
  isoString?: string;
}

const FormattedTime: React.FC<FormattedTimeProps> = ({ isoString }) => {
  if (!isoString) return <span>Invalid date</span>;

  const formattedTime = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));

  return <span>{formattedTime}</span>;
};

export default FormattedTime;
