
import PaymentStatus from "./PaymentStatus";

const HeaderPaymentStatus = () => {
  // We can later add more complex logic here if needed
  return (
    <div className="hidden md:block">
      <PaymentStatus />
    </div>
  );
};

export default HeaderPaymentStatus;
