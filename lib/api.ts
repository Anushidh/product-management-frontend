import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "https://ourapp.space/api";

export const api = axios.create({
  baseURL: base,
});
