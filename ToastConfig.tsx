import { ToastContainer, ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultToastProps: ToastContainerProps = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
};

export default function ToastConfig(props: Partial<ToastContainerProps>) {
  return <ToastContainer {...defaultToastProps} {...props} />;
}