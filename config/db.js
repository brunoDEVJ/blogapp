const getMongoURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return "mongodb+srv://brunodevj:0EYYa1UCNrIXLUd0@blogapp.mrz5sbd.mongodb.net/?retryWrites=true&w=majori";
  }
  return "mongodb://127.0.0.1/blogapp";
};

export const mongoURL = getMongoURL();
