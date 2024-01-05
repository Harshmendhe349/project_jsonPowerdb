/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


var jpdbBaseURL = 'http://api.login2explore.com:5577';
var jpdbIRL = '/api/irl';
var jpbdIML = '/api/iml';
var studentDatabaseName = 'PROJECT-DB';
var studentRelationName = 'PROJECT-TABLE';
var connectionToken = '90931884|-31949301662687756|90963172';

$('#projectId').focus();



//Function for return alter HTML code according to status of response
function alertHandlerHTML(status, message) {
    // 1--> Success , 0--> Warning
    
    if (status === 1) {
        return `<div class="alert  alert-primary d-flex align-items-center alert-dismissible " role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
                <div>
                  <strong>Success!</strong> ${message}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
    } else {
        return `<div class="alert  alert-warning d-flex align-items-center alert-dismissible" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
        <div>
          <strong>Warning!</strong> ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }

}

function alertHandler(status, message) {
    var alterHTML = alertHandlerHTML(status, message);
    let alertDiv = document.createElement('div');
    alertDiv.innerHTML = alterHTML;
    $('#disposalAlertContainer').append(alertDiv);
}


function saveRecNoToLocalStorage(jsonObject) {
    var lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}

function disableAllFeildExceptprojectId() {
    $('#projectName').prop('disabled', true);
    $('#assignedTo').prop('disabled', true);
    $('#assignmentDate').prop('disabled', true);
    $('#description').prop('disabled', true);
    $('#deadline').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
    $('#saveBtn').prop('disabled', true);
    $('#updateBtn').prop('disabled', true);
}


//Function for reset form data and disable all other feild except roll number
function resetForm() {
    $('#projectId').val("");
    $('#projectName').val("");
    $('#assignedTo').val("");
    $('#assignmentDate').val("");
    $('#description').val("");
    $('#deadline').val("");

    $('#projectId').prop('disabled', false);
    disableAllFeildExceptprojectId();
    $('#projectId').focus();


}

//Function for fill data if student already is present in database
function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#projectName').val("");
        $('#assignedTo').val("");
        $('#assignmentDate').val("");
        $('#description').val("");
        $('#deadline').val("");
    } else {
        // student record number saved to localstorage
        saveRecNoToLocalStorage(jsonObject);
        
        // parse json object into JSON
        var data = JSON.parse(jsonObject.data).record;
        
        $('#projectName').val(data.name);
        $('#assignedTo').val(data.assignedTo);
        $('#assignmentDate').val(data.assignmentDate);
        $('#description').val(data.description);
        $('#deadline').val(data.deadline);
    }
}


//Function to check validity of Enrollment Number
function validatedeadline() {
    var inputassignmentDate = $('#assignmentDate').val();
    var inputdeadline = $('#deadline').val();
    inputassignmentDate = new Date(inputassignmentDate);
    inputdeadline = new Date(inputdeadline);
    
    //Enrollment date should be greater than Birth date
    return inputassignmentDate.getTime() < inputdeadline.getTime();

}

//Function to check validity of user input data
function validateFormData() {
    var projectId, name, assignedTo, assignmentDate, description, deadline;
    projectId = $('#projectId').val();
    name = $('#projectName').val();
    assignedTo = $('#assignedTo').val();
    assignmentDate = $('#assignmentDate').val();
    description = $('#description').val();
    deadline = $('#deadline').val();

    if (projectId === '') {
        alertHandler(0, 'Roll NO Missing');
        $('#projectId').focus();
        return "";
    }

    if (projectId <= 0) {
        alertHandler(0, 'Invalid Roll-No');
        $('#projectId').focus();
        return "";
    }

    if (assignedTo === '') {
        alertHandler(0, 'assignedTo Name is Missing');
        $('#assignedTo').focus();
        return "";
    }
    if (assignedTo <= 0 && assignedTo > 12) {
        alertHandler(0, 'Invalid assignedTo Name');
        $('#assignedTo').focus();
        return "";
    }
    if (assignmentDate === '') {
        alertHandler(0, 'Birth Date Is Missing');
        $('#assignmentDate').focus();
        return "";
    }
    if (description === '') {
        alertHandler(0, 'description Is Missing');
        $('#description').focus();
        return "";
    }
    if (deadline === '') {
        alertHandler(0, 'Enrollment Data Is Missing');
        $('#deadline').focus();
        return "";
    }

    if (!validatedeadline()) {
        alertHandler(0, 'Invalid Enrollment Date(i.e Enrollment Date should be greater than Birth Date)');
        $('#deadline').focus();
        return "";
    }

    // if data is valid then create a JSON object otherwise return empty string( which denote that data is not valid )
    var jsonStrObj = {
        projectId: projectId,
        name: name,
        assignedTo: assignedTo,
        assignmentDate: assignmentDate,
        description: description,
        deadline: deadline
    };
    
    //Convert JSON object into string 
    return JSON.stringify(jsonStrObj);
}


//Function to return stringified JSON object whcih contain roll number of student
function getStudentprojectIdAsJsonObj() {
    var projectId = $('#projectId').val();
    var jsonStr = {
        id: projectId
    };
    return JSON.stringify(jsonStr);
}


// Function to query details of existing student
function getStudentData() {

     
    if ($('#projectId').val() === "") { // if roll number is not given then disable all feild
        disableAllFeildExceptprojectId();
    } else if ($('#projectId').val() < 1) { // if roll number is not valid (i.e roll-no <1)
        disableAllFeildExceptprojectId();
        alertHandler(0, 'Invalid Roll-No');
        $('#projectId').focus();
    } else { // if roll number is valid
        var studentprojectIdJsonObj = getStudentprojectIdAsJsonObj(); 
        
        // create GET Request object
        var getRequest = createGET_BY_KEYRequest(connectionToken, studentDatabaseName, studentRelationName, studentprojectIdJsonObj);
        
        jQuery.ajaxSetup({async: false});
        // make GET request
        var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({async: true});
        
        // Enable all feild
        $('#projectId').prop('disabled', false);
        $('#projectName').prop('disabled', false);
        $('#assignedTo').prop('disabled', false);
        $('#assignmentDate').prop('disabled', false);
        $('#description').prop('disabled', false);
        $('#deadline').prop('disabled', false);

        
        if (resJsonObj.status === 400) { // if student is not exist already with same roll number then enable save and reset btn
            $('#resetBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', true);
            fillData("");
            $('#name').focus();
        } else if (resJsonObj.status === 200) {// if student is exist already with same roll number then enable update and reset btn
            $('#projectId').prop('disabled', true);
            fillData(resJsonObj);
            $('#resetBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', true);
            $('#name').focus();
        }
    }



}

//Function to make PUT request to save data into database
function saveData() {
    var jsonStrObj = validateFormData();
    
    // If form data is not valid
    if (jsonStrObj === '')
        return '';

    // create PUT Request object
    var putRequest = createPUTRequest(connectionToken, jsonStrObj, studentDatabaseName, studentRelationName);
    jQuery.ajaxSetup({async: false});
    
    //Make PUT Request for saving data into database
    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});
    
    if (resJsonObj.status === 400) {// If data is not saved
        alertHandler(0, 'Data Is Not Saved ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alertHandler(1, 'Data Saved successfully');
    }
    //After saving to databse resent from data 
    resetForm();
    
    $('#empid').focus();
}



//Function used to make UPDATE Request
function changeData() {
    $('#changeBtn').prop('disabled', true);
    var jsonChg = validateFormData(); // Before making UPDATE Request validate form data
    
    // Create UPDATE Request object
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, studentDatabaseName, studentRelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({async: false});
    
    //Make UPDATE Request
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});
    
    if (resJsonObj.status === 400) {// If data is not saved
        alertHandler(0, 'Data Is Not Update ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alertHandler(1, 'Data Update successfully');
    }
    
    //After updating to databse resent from data
    resetForm();
    $('#empid').focus();
}