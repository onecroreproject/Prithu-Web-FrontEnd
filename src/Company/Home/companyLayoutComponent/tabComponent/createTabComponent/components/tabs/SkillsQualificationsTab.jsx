import React, { useState, useEffect } from "react";
import {
  FiTool,
  FiHeart,
  FiAward,
  FiPlus,
  FiX,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import {
  MdSchool
} from "react-icons/md";

// Import the education data
import educationData from "../../../../../../../JsonFile/education.json";

const SkillsQualificationsTab = ({
  formData,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField
}) => {
  // Extract education levels from JSON
  const educationLevels = educationData.educationLevels || [];

  // State for adding new qualification
  const [newQualification, setNewQualification] = useState({
    educationLevel: "",
    course: "",
    specialization: ""
  });
  
  // Dropdown visibility states
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  
  // Filtered courses
  const [filteredCourses, setFilteredCourses] = useState([]);

  // State for candidate type
  const [candidateType, setCandidateType] = useState(
    formData.freshersAllowed === true ? "fresher" : 
    (formData.minimumExperience || formData.maximumExperience ? "experienced" : "fresher")
  );

  // State for tag-based inputs
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");

  // Get courses for selected education level
  const getCoursesForLevel = (levelName) => {
    const level = educationLevels.find(l => l.level === levelName);
    return level ? level.courses : [];
  };

  // Check if level has courses
  const hasCourses = (levelName) => {
    const courses = getCoursesForLevel(levelName);
    return courses && courses.length > 0;
  };

  // Handle education level change in new qualification
  const handleEducationLevelChange = (e) => {
    const value = e.target.value;
    setNewQualification({
      educationLevel: value,
      course: "",
      specialization: ""
    });
    
    // Update filtered courses
    if (value && hasCourses(value)) {
      const courses = getCoursesForLevel(value);
      setFilteredCourses(courses);
    } else {
      setFilteredCourses([]);
    }
  };

  // Handle course selection
  const handleCourseSelect = (course) => {
    setNewQualification({
      ...newQualification,
      course,
      specialization: ""
    });
    setShowCourseDropdown(false);
  };

  // Handle specialization input change
  const handleSpecializationChange = (e) => {
    setNewQualification({
      ...newQualification,
      specialization: e.target.value
    });
  };

  // Add new qualification
  const handleAddQualification = () => {
    if (newQualification.educationLevel) {
      // Create full qualification string
      let fullQual = newQualification.educationLevel;
      
      // Add course only if it exists and is not "Any"
      if (newQualification.course && newQualification.course !== "Any" && newQualification.course !== "") {
        fullQual += ` - ${newQualification.course}`;
      }
      
      // Add specialization if it exists
      if (newQualification.specialization) {
        fullQual += ` (${newQualification.specialization})`;
      }
      
      // Create qualification object
      const qualification = {
        educationLevel: newQualification.educationLevel,
        course: newQualification.course || "",
        specialization: newQualification.specialization || "",
        fullQualification: fullQual
      };
      
      // Check if this qualification already exists
      const exists = formData.qualifications?.some(q => 
        q.fullQualification === qualification.fullQualification
      );
      
      if (!exists) {
        // Add to form data
        const currentIndex = formData.qualifications?.length || 0;
        addArrayField('qualifications');
        
        // Update the qualification
        handleQualificationChange(currentIndex, qualification);
      }
      
      // Reset form
      setNewQualification({
        educationLevel: "",
        course: "",
        specialization: ""
      });
      setFilteredCourses([]);
    }
  };

  // Custom handler for qualification changes
  const handleQualificationChange = (index, qualification) => {
    const updatedQualifications = [...(formData.qualifications || [])];
    updatedQualifications[index] = qualification;
    
    handleInputChange({
      target: {
        name: 'qualifications',
        value: updatedQualifications
      }
    });
  };

  // Remove a qualification
  const handleRemoveQualification = (index) => {
    const updatedQualifications = [...(formData.qualifications || [])];
    updatedQualifications.splice(index, 1);
    
    handleInputChange({
      target: {
        name: 'qualifications',
        value: updatedQualifications
      }
    });
  };

  // Handle candidate type change
  const handleCandidateTypeChange = (type) => {
    setCandidateType(type);
    
    if (type === "fresher") {
      // Clear experience fields and set freshersAllowed to true
      handleInputChange({ target: { name: 'minimumExperience', value: '' } });
      handleInputChange({ target: { name: 'maximumExperience', value: '' } });
      handleInputChange({ target: { name: 'freshersAllowed', value: true } });
    } else {
      // Set freshersAllowed to false
      handleInputChange({ target: { name: 'freshersAllowed', value: false } });
    }
  };

  // Handle adding a required skill
  const handleAddRequiredSkill = () => {
    if (requiredSkillInput.trim()) {
      const newSkill = requiredSkillInput.trim();
      if (!formData.requiredSkills?.includes(newSkill)) {
        const currentIndex = formData.requiredSkills?.length || 0;
        addArrayField('requiredSkills');
        handleArrayInputChange(currentIndex, 'requiredSkills', newSkill);
      }
      setRequiredSkillInput("");
    }
  };

  // Handle adding a certification
  const handleAddCertification = () => {
    if (certificationInput.trim()) {
      const newCert = certificationInput.trim();
      if (!formData.certificationRequired?.includes(newCert)) {
        const currentIndex = formData.certificationRequired?.length || 0;
        addArrayField('certificationRequired');
        handleArrayInputChange(currentIndex, 'certificationRequired', newCert);
      }
      setCertificationInput("");
    }
  };

  // Handle key press for inputs
  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch(type) {
        case 'requiredSkill':
          handleAddRequiredSkill();
          break;
        case 'certification':
          handleAddCertification();
          break;
        case 'qualification':
          handleAddQualification();
          break;
        default:
          break;
      }
    }
  };

  // Initialize from existing data
  useEffect(() => {
    // Set candidate type based on existing data
    if (formData.freshersAllowed === true) {
      setCandidateType("fresher");
    } else if (formData.minimumExperience || formData.maximumExperience) {
      setCandidateType("experienced");
    }
  }, []);

  // Render skill tags component
  const renderSkillTags = (skills, type, inputValue, setInputValue, handleAdd, placeholder) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        <div className="flex items-center gap-2">
          {type === 'requiredSkills' && <FiTool className="text-blue-600" />}
          {type === 'certificationRequired' && <FiAward className="text-blue-600" />}
          {type === 'requiredSkills' && "Required Skills"}
          {type === 'certificationRequired' && "Certifications Required"}
        </div>
      </label>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 
              type === 'requiredSkills' ? 'requiredSkill' : 'certification'
            )}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder={placeholder}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          <FiPlus />
          Add
        </button>
      </div>
      
      {skills?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => {
            if (!skill || skill.trim() === "") return null;
            
            return (
              <div
                key={index}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200"
              >
                <span className="text-sm font-medium">{skill}</span>
                <button
                  type="button"
                  onClick={() => removeArrayField(index, type)}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-full p-0.5"
                  title="Remove"
                >
                  <FiX size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render qualification tags
  const renderQualificationTags = () => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        <div className="flex items-center gap-2">
          <MdSchool className="text-blue-600" />
          Added Qualifications
        </div>
      </label>
      
      {formData.qualifications && formData.qualifications.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {formData.qualifications.map((qual, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200"
            >
              <span className="text-sm font-medium">
                {qual.fullQualification || 
                  (qual.course ? `${qual.educationLevel} - ${qual.course}` : qual.educationLevel)}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveQualification(index)}
                className="text-green-700 hover:text-green-900 hover:bg-green-100 rounded-full p-0.5"
                title="Remove"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No qualifications added yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Required Skills */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        {renderSkillTags(
          formData.requiredSkills || [],
          'requiredSkills',
          requiredSkillInput,
          setRequiredSkillInput,
          handleAddRequiredSkill,
          "Enter a required skill and press Add or Enter"
        )}
      </div>

      {/* Qualifications */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          <div className="flex items-center gap-2">
            <MdSchool className="text-blue-600" />
            Qualifications (Add Multiple)
          </div>
        </h3>

        {/* Display existing qualifications */}
        {renderQualificationTags()}

        {/* Add New Qualification Form */}
        <div className="space-y-6 p-4 bg-gray-50 rounded-lg mb-6">
          <h4 className="text-md font-semibold text-gray-800">Add New Qualification</h4>
          
          {/* Education Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Education Level *</label>
            <select
              value={newQualification.educationLevel}
              onChange={handleEducationLevelChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Education Level</option>
              {educationLevels.map(level => (
                <option key={level.level} value={level.level}>{level.level}</option>
              ))}
              <option value="No Formal Education Required">No Formal Education Required</option>
            </select>
          </div>

          {/* Course Selection - Only show if level has courses */}
          {newQualification.educationLevel && 
           newQualification.educationLevel !== "No Formal Education Required" &&
           hasCourses(newQualification.educationLevel) && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Course / Degree</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all flex justify-between items-center"
                >
                  <span className={newQualification.course ? "text-gray-900" : "text-gray-500"}>
                    {newQualification.course || "Select Course (Optional)"}
                  </span>
                  {showCourseDropdown ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                
                {showCourseDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                      <div className="py-1">
                        <div
                          onClick={() => {
                            setNewQualification({...newQualification, course: ""});
                            setShowCourseDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors hover:text-blue-700 text-gray-500"
                        >
                          None (Just {newQualification.educationLevel})
                        </div>
                        {filteredCourses.map((course, index) => (
                          <div
                            key={index}
                            onClick={() => handleCourseSelect(course)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors hover:text-blue-700"
                          >
                            {course}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-gray-500">No courses found for this level</div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional. For levels like SSLC/HSC, you can leave this empty.
              </p>
            </div>
          )}

          {/* Specialization Input (Optional) - Only show if a specific course is selected */}
          {newQualification.course && 
           newQualification.course !== "" && 
           newQualification.course !== "Any" && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Specialization (Optional)</label>
              <input
                type="text"
                value={newQualification.specialization}
                onChange={handleSpecializationChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g., Computer Science, Electrical Engineering, etc."
              />
              <p className="text-xs text-gray-500 mt-1">Enter specific specialization if needed</p>
            </div>
          )}

          {/* Add Qualification Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddQualification}
              disabled={!newQualification.educationLevel}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                newQualification.educationLevel
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onKeyPress={(e) => handleKeyPress(e, 'qualification')}
            >
              <FiPlus />
              Add This Qualification
            </button>
          </div>
        </div>

        {/* Candidate Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">Candidate Type *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleCandidateTypeChange("fresher")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                candidateType === "fresher"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-25"
              }`}
            >
              <span className="font-semibold text-lg">Fresher</span>
              <span className="text-sm mt-1">(0 years experience)</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleCandidateTypeChange("experienced")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                candidateType === "experienced"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-25"
              }`}
            >
              <span className="font-semibold text-lg">Experienced</span>
              <span className="text-sm mt-1">(1+ years experience)</span>
            </button>
          </div>
        </div>

        {/* Experience Fields - Only show for Experienced candidates */}
        {candidateType === "experienced" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Minimum Experience (years) *</label>
              <input
                type="number"
                name="minimumExperience"
                value={formData.minimumExperience || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required={candidateType === "experienced"}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 1 year for experienced candidates</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Maximum Experience (years)</label>
              <input
                type="number"
                name="maximumExperience"
                value={formData.maximumExperience || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Certifications Required */}
        <div className="pt-6 border-t border-gray-200">
          {renderSkillTags(
            formData.certificationRequired || [],
            'certificationRequired',
            certificationInput,
            setCertificationInput,
            handleAddCertification,
            "Enter a certification and press Add or Enter"
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsQualificationsTab;