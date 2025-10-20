import { useNavigate } from "react-router-dom";
import { Layout } from "~/components/Layout";
import { WebsiteRegistrationForm } from "~/components/WebsiteRegistrationForm";
import type { Website } from "~/types";

export function RegisterWebsite() {
  const navigate = useNavigate();

  const handleSubmit = async (data: Partial<Website>) => {
    console.log("Submitting website registration:", data);

    // In a real app, this would call the API
    // For now, just simulate success
    await new Promise((resolve) => setTimeout(resolve, 1500));

    alert("Website registered successfully!");
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <Layout>
      {/* Page Title */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Register New Website</h1>
          <p className="mt-2 text-white/90">
            Add your website to enable intelligent navigation for your users
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="py-8">
        <WebsiteRegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </Layout>
  );
}
