package project.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.model.StudentView;
import project.repository.StudentRepository;

import java.util.List;

import static project.repository.Validator.validateDepartmentId;
import static project.repository.Validator.validateStudentId;

@RestController
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;

    @GetMapping("/dep_{N}/students/data")
    public List<StudentView> getAllStudents(@PathVariable("N") int departmentId) {
        validateDepartmentId(departmentId);
        return studentRepository.getStudentsView(departmentId);
    }

    @GetMapping("/dep_{N}/students/{id}")
    public StudentView findStudentById(@PathVariable("N") int departmentId, @PathVariable("id") String studentId) {
        validateDepartmentId(departmentId);
        validateStudentId(studentId);
        return studentRepository.getStudentById(departmentId, studentId);
    }

    @PostMapping("/dep_{N}/students/data")
    public void addNewStudent(@RequestBody StudentView student, @PathVariable("N") int departmentId) {
        validateDepartmentId(departmentId);
        studentRepository.addNewStudent(departmentId, student);
    }

    @PutMapping("/dep_{N}/students/data")
    public void updateStudent(@RequestBody StudentView student, @PathVariable("N") int departmentId) {
        validateDepartmentId(departmentId);
        validateStudentId(student.getStudentId());
        studentRepository.updateStudent(departmentId, student);
    }

    @DeleteMapping("/dep_{N}/students/{id}")
    public void deleteStudentById(@PathVariable("N") int departmentId, @PathVariable("id") String studentId) {
        validateDepartmentId(departmentId);
        validateStudentId(studentId);
        studentRepository.deleteStudentById(departmentId, studentId);
    }
}
