import React from "react";
import BasicInfoTab from "./BasicInfoTab";
import JobDetailsAndSalaryTab from "./JobDetailsTab";
import SkillsQualificationsTab from "./SkillsQualificationsTab";

const FormTabs = ({
  activeTab,
  formData,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField,
  handleQualificationChange,
  addQualification,
  removeQualification,
  errors,
  setErrors,
  industrySearch,
  setIndustrySearch,
  showIndustryDropdown,
  setShowIndustryDropdown,
  filteredIndustries,
  roleSearch,
  setRoleSearch,
  showRoleDropdown,
  setShowRoleDropdown,
  filteredRoles,
  employmentTypes,
  workModes,
  shiftTypes,
  urgencyLevels,
  locationData,
  locationLoading,
  industryRef,
  roleRef,
  educationLevels,
  salaryTypes = ["monthly", "yearly", "hourly"],
  salaryCurrencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD"],
  handleFileChange,
  removeImage,
  jobImage,
  existingImage
}) => {
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Job Information</h2>
              <p className="text-gray-600">Fill in the essential details about the job position.</p>
            </div>
            
            <BasicInfoTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleArrayInputChange={handleArrayInputChange}
              addArrayField={addArrayField}
              removeArrayField={removeArrayField}
              errors={errors}
              setErrors={setErrors}
              industrySearch={industrySearch}
              setIndustrySearch={setIndustrySearch}
              showIndustryDropdown={showIndustryDropdown}
              setShowIndustryDropdown={setShowIndustryDropdown}
              filteredIndustries={filteredIndustries}
              roleSearch={roleSearch}
              setRoleSearch={setRoleSearch}
              showRoleDropdown={showRoleDropdown}
              setShowRoleDropdown={setShowRoleDropdown}
              filteredRoles={filteredRoles}
              employmentTypes={employmentTypes}
              workModes={workModes}
              shiftTypes={shiftTypes}
              urgencyLevels={urgencyLevels}
              countries={locationData.countries}
              states={locationData.states}
              cities={locationData.cities}
              areas={locationData.areas}
              pincodes={locationData.pincodes}
              loading={locationLoading}
              industryRef={industryRef}
              roleRef={roleRef}
            />
          </div>
        );

      case 'salary':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Details & Salary</h2>
              <p className="text-gray-600">Describe the job role, responsibilities, and define compensation.</p>
            </div>
            
            <JobDetailsAndSalaryTab
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleArrayInputChange={handleArrayInputChange}
              addArrayField={addArrayField}
              removeArrayField={removeArrayField}
              salaryTypes={salaryTypes}
              salaryCurrencies={salaryCurrencies}
              handleFileChange={handleFileChange}
              removeImage={removeImage}
              jobImage={jobImage}
              existingImage={existingImage}
            />
          </div>
        );

      case 'additional':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Qualifications</h2>
              <p className="text-gray-600">Define the required skills, qualifications, and experience for this position.</p>
            </div>

            <SkillsQualificationsTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleArrayInputChange={handleArrayInputChange}
              addArrayField={addArrayField}
              removeArrayField={removeArrayField}
              handleQualificationChange={handleQualificationChange}
              addQualification={addQualification}
              removeQualification={removeQualification}
              educationLevels={educationLevels}
              errors={errors}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return renderTabContent();
};

export default FormTabs;