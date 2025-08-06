"use client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const toast = useToast();
  const router = useRouter();

  // Backend API base URL
  // Backend API base URL (Render)
  const API_URL = "https://money-splitter-app-lu6r.onrender.com";

  // Register user via backend
  const registerUser = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let message = "Registration failed";
      if (res.status === 409) {
        message = "User already exists";
      } else {
        try {
          const data = await res.json();
          message = data.message || message;
        } catch {}
      }
      throw new Error(message);
    }
    return res.json();
  };

  // Login user via backend
  const loginUser = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let message = "Invalid credentials";
      if (res.status === 401) {
        message = "Invalid email or password";
      } else {
        try {
          const data = await res.json();
          message = data.message || message;
        } catch {}
      }
      throw new Error(message);
    }
    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please enter email and password.", status: "warning" });
      return;
    }
    try {
      if (isLogin) {
        // Login
        const user = await loginUser(email, password);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", user.id.toString());
        router.push("/");
      } else {
        // Register
        await registerUser(email, password);
        toast({
          title: "Registration successful! Please login.",
          status: "success",
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: err.message || "Authentication failed", status: "error" });
    }
  };

  return (
    <Box
      maxW="sm"
      mx="auto"
      mt={20}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading mb={6} textAlign="center">
        {isLogin ? "Login" : "Sign Up"}
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>
          <Button colorScheme="teal" type="submit">
            {isLogin ? "Login" : "Sign Up"}
          </Button>
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
