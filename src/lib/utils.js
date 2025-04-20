const formatDate = (timestamp) => {
    if (timestamp.seconds && timestamp.nanoseconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return new Date(timestamp).toLocaleString();
  };

  export { formatDate };