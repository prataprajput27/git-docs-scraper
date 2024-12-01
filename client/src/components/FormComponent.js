import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import RepoLister from "./RepoLister";

const FormComponent = () => {
  const [repoData, setRepoData] = useState(null); // State to hold fetched data
  const [formValues, setFormValues] = useState({ ownerUsername: "", repoName: "" }); // State to store form values
  const [isLoading, setIsLoading] = useState(false); // Loading state for fetch

  const fetchRepoData = async (ownerUsername, repoName) => {
    setIsLoading(true); // Set loading to true when starting to fetch data
    try {
      const response = await fetch(
        `http://localhost:3000/api/files/listMdFiles?owner=${ownerUsername}&repo=${repoName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch repository data.");
      }
      const data = await response.json();
      setRepoData(data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching repository data:", error);
      setRepoData(null); // Reset data on error
    } finally {
      setIsLoading(false); // Set loading to false after fetch is complete
    }
  };

  return (
    <div className="flex items-center mt-2 justify-center min-h-screen flex-col space-y-6">
      <Formik
        initialValues={{ ownerUsername: "", repoName: "" }}
        validationSchema={Yup.object({
          ownerUsername: Yup.string()
            .max(30, "Must be 30 characters or less")
            .required("Owner username is required"),
          repoName: Yup.string()
            .max(50, "Must be 50 characters or less")
            .required("Repo name is required"),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setFormValues(values);
          fetchRepoData(values.ownerUsername, values.repoName);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="max-w-5xl w-full mx-auto p-6 bg-white bg-opacity-5 rounded-lg shadow-xl">
            <div className="flex items-center space-x-5">
              <div className="flex-1">
                <label
                  htmlFor="ownerUsername"
                  className="block text-sm font-medium text-white"
                >
                  Owner Username
                </label>
                <Field
                  name="ownerUsername"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="min-h-[24px]">
                  <ErrorMessage
                    name="ownerUsername"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="repoName"
                  className="block text-sm font-medium text-white"
                >
                  Repo Name
                </label>
                <Field
                  name="repoName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="min-h-[24px]">
                  <ErrorMessage
                    name="repoName"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex-none">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Pass fetched data, form values, and loading state to RepoLister */}
      <RepoLister
        data={repoData}
        owner={formValues.ownerUsername}
        repo={formValues.repoName}
        isLoading={isLoading} // Pass the loading state to the RepoLister component
      />
    </div>
  );
};

export default FormComponent;
