const getMongoURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return "mongodb+srv://boylima22:V7NjZEfwS4hhnRJ4@blogapp.cihpuji.mongodb.net/";
  }
  return "mongodb://127.0.0.1/blogapp";
};

export const mongoURL = getMongoURL();
