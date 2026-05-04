import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthProvider } from "../context/AuthContext";
import api from "../api/axios";

// Mock the API module
jest.mock("../api/axios");
const mockedApi = api as jest.Mocked<typeof api>;

describe("Login Page: Behavioral Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it("HAPPY PATH: successful login redirects user", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: { _id: "123", name: "Test User", email: "test@test.com" },
          token: "fake-jwt-token"
        }
      }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText(/SIGN IN/i));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password123",
      });
    });
  });

  it("FAILURE: displays error message on invalid credentials", async () => {
    mockedApi.post.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" }
      }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByText(/SIGN IN/i));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
