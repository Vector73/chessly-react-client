import { useNavigate } from "react-router-dom";
import { Descope, useSession } from "@descope/react-sdk";
import { useDispatch } from "react-redux";
import { setUser } from "../features/userSlice";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {isAuthenticated} = useSession();

  useEffect(() => {
    if (isAuthenticated) navigate("/home")
  }, [isAuthenticated])

  const onLogin = async (userData) => {
    console.log("login", userData)
    
    dispatch(setUser({
      username: userData.user.displayName || userData.user.loginIds[2],
      email: userData.user.email,
      userId: userData.user.userId,
    }))
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const status = await response.json();
  }

  return (
    <div className="body login-page">
      <div className="btn-container w-50">
        <Descope
          flowId="sign-up-or-in"
          theme="dark"
          onSuccess={(e) => {
            onLogin(e.detail)
            navigate("/home");
          }}
          onError={(err) => {
            console.log("Error!", err);
            alert("Error: " + err.detail.message);
          }}
        />
      </div>
    </div>
  );
}