export const formatters = {
  number: (value, type) => {
    if (type === "$") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }
    return `${value}${type}`;
  },

  truncateText: (text, maxLength = 12) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  },
};
