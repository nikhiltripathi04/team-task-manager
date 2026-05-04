export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "member";
}

export interface LoginDTO {
  email: string;
  password: string;
}