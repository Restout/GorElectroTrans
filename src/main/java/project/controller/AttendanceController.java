package project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.model.Attendance;
import project.model.AttendanceView;
import project.repository.AttendanceRepository;

import java.util.List;

import static project.exceptions.Validator.validateDepartmentId;
import static project.exceptions.Validator.validatePaginationParams;

@RestController("AttendanceControllerBean")
public class AttendanceController {

    @Autowired
    AttendanceRepository attendanceRepository;

    @GetMapping("/dep_{N}/attendance/data")
    public ResponseEntity<List<AttendanceView>> getAllRecords(@PathVariable("N") int departmentId,
                                                              @RequestParam(value = "page", required = true) String page,
                                                              @RequestParam(value = "size", required = true) String pageSize) {

        validateDepartmentId(departmentId);
        validatePaginationParams(page, pageSize);
        HttpHeaders headers = new HttpHeaders();
        headers.add("students_count", String.valueOf(attendanceRepository.getRecordsAttendanceCount(departmentId)));
        return ResponseEntity
                .ok()
                .headers(headers)
                .body(attendanceRepository.getAllRecords(departmentId, Integer.valueOf(page), Integer.valueOf(pageSize)));
    }

    @GetMapping("/dep_{N}/attendance/{id}")
    public AttendanceView getRecordAttendanceByStudentId(@PathVariable("N") int departmentId, @PathVariable("id") String studentId) {
        validateDepartmentId(departmentId);
        return attendanceRepository.getAttendanceByStudent(departmentId, studentId);
    }

    @PostMapping("/dep_{N}/attendance/data")
    public void addNewRecordAttendance(@PathVariable("N") int departmentId, @RequestBody Attendance attendance) {
        validateDepartmentId(departmentId);
        attendanceRepository.addNewRecord(departmentId, attendance);
    }

    @PutMapping("/dep_{N}/attendance/data")
    public void updateRecordAttendance(@PathVariable("N") int departmentId, @RequestBody Attendance attendance) {
        validateDepartmentId(departmentId);
        attendanceRepository.updateRecordAttendance(departmentId, attendance);
    }

    @DeleteMapping("/dep_{N}/attendance/data")
    public void deleteRecordById(@PathVariable("N") int departmentId, @RequestBody Attendance attendance) {
        validateDepartmentId(departmentId);
        attendanceRepository.deleteRecordById(departmentId, attendance);
    }

}
