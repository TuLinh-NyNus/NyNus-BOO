import { UserServiceClient } from "../generated/v1/UserServiceClientPb";
const {
  RegisterRequest,
  LoginRequest,
  GetUserRequest,
  ListUsersRequest,
} = require("../generated/v1/user_pb");

// gRPC-Web client configuration
const GRPC_WEB_URL = "http://localhost:8080"; // This will be the gRPC-Web proxy URL

class GrpcClientService {
  private userServiceClient: UserServiceClient;

  constructor() {
    this.userServiceClient = new UserServiceClient(GRPC_WEB_URL);
  }

  // User Service Methods
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const request = new RegisterRequest();
    request.setEmail(email);
    request.setPassword(password);
    request.setFirstName(firstName);
    request.setLastName(lastName);

    return new Promise((resolve, reject) => {
      this.userServiceClient.register(request, {}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  async login(email: string, password: string) {
    const request = new LoginRequest();
    request.setEmail(email);
    request.setPassword(password);

    return new Promise((resolve, reject) => {
      this.userServiceClient.login(request, {}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getUser(userId: string, token: string) {
    const request = new GetUserRequest();
    request.setUserId(userId);

    const metadata = {
      authorization: `Bearer ${token}`,
    };

    return new Promise((resolve, reject) => {
      this.userServiceClient.getUser(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  async listUsers(token: string, page: number = 1, pageSize: number = 10) {
    const request = new ListUsersRequest();
    request.setPage(page);
    request.setPageSize(pageSize);

    const metadata = {
      authorization: `Bearer ${token}`,
    };

    return new Promise((resolve, reject) => {
      this.userServiceClient.listUsers(request, metadata, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Export singleton instance
export const grpcClient = new GrpcClientService();
export default grpcClient;
