//전역변수
const API_BASE_URL = "http://localhost:8080";

//DOM 엘리먼트 가져오기
const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");

//Document Load 이벤트 처리하기
document.addEventListener("DOMContentLoaded", function () {
    loadStudents();
});

//Form Submit 이벤트 처리하기
studentForm.addEventListener("submit", function (event) {
    //기본으로 설정된 Event가 동작하지 않도록 하기 위함
    event.preventDefault();
    console.log("Form 제출 되었음...");

    //FormData 객체생성
    const stuFormData = new FormData(studentForm);
    stuFormData.forEach((value, key) => {
        console.log(key + ' = ' + value);
    });

    //사용자 정의 Student 객체생성 (공백 제거)
    const studentData = {
        name: stuFormData.get("name").trim(),
        studentNumber: stuFormData.get("studentNumber").trim(),
        address: stuFormData.get("address").trim(),
        phoneNumber: stuFormData.get("phoneNumber").trim(),
        email: stuFormData.get("email").trim(),
        dateOfBirth: stuFormData.get("dateOfBirth"),
    };

    //유효성 체크하기
    if(!validateStudent(studentData)){
        //검증체크 실패하면 리턴하기
        return;
    }


});


//데이터 유효성을 체크하는 함수
function validateStudent(student){

}


//학생목록 로드하는 함수
function loadStudents() {
    console.log("학생 목록 로드 중.....");
}

