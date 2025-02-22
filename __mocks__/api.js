// __mocks__/api.js
const axiosInstance = {
  get: jest.fn(),
  post: jest.fn(), // Добавьте другие методы, если они используются
};

export default axiosInstance;
