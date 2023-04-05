import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Alert from "../../../components/Alert";
import Loader from "../../../components/Loader";
import EditAttendanceModal from "../../../components/modals/attendance/EditAttendanceModal";
import Pagination from "../../../components/Pagination";
import Table from "../../../components/Table";
import TableBodyRow from "../../../components/Table/TableBodyRow";
import TableBodyCell from "../../../components/Table/TableBodyRow/TableBodyCell";
import TableHead from "../../../components/Table/TableHead";
import TableHeadCell from "../../../components/Table/TableHead/TableHeadCell";
import { ALERT } from "../../../constants/alertTypes";
import { ATTENDACE_RESULT_VALUE } from "../../../constants/attendanceResult";
import { useAttendanceContext } from "../../../context/attendanceContext";
import { formatDate } from "../../../helpers/formatDate";
import useLockedBody from "../../../hooks/useLockedBody";
import { IAttendance } from "../../../models/Attendance";
import AttendanceService from "../../../services/AttendanceService";

import "./styles.scss";

const LIMIT = 15;

const Attendance: React.FC = () => {
    const [editingAttendance, setEditingAttendance] = React.useState<IAttendance | null>(null);
    useLockedBody(!!editingAttendance);

    const { divisionId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const { attendances, setAttendances } = useAttendanceContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState<number>(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const cancelToken = axios.CancelToken.source();
        setIsFetching(true);
        setError(null);

        const fetchAttendance = async () => {
            try {
                const response = await AttendanceService.fetch(divisionId, {
                    params: {
                        page,
                        size: LIMIT,
                    },
                    cancelToken: cancelToken.token,
                });
                console.log(response);
                const totalPlans = response.headers["attendance_count"];
                const totalPages = totalPlans ? Math.ceil(totalPlans / LIMIT) : 1;
                setAttendances(response.data);
                setTotalPages(totalPages);
            } catch (error) {
                console.log(error);
                const err = error as any;
                setError(err?.response?.data?.message ?? "Не удалось получить данные с сервера");
            } finally {
                setIsLoading(false);
                setIsFetching(false);
            }
        };

        fetchAttendance();

        return () => cancelToken.cancel();
    }, [page, setAttendances, divisionId]);

    const handleOpenEditing = (event: React.MouseEvent<HTMLTableRowElement>, attendace: IAttendance) => {
        event.stopPropagation();
        setEditingAttendance(attendace);
    };

    const handlePageChange = (selectedItem: { selected: number }) => {
        setPage(selectedItem.selected + 1);
        searchParams.set("page", String(selectedItem.selected + 1));
        setSearchParams(searchParams);
    };

    return (
        <div className="attendance">
            {editingAttendance && (
                <EditAttendanceModal closeEditing={() => setEditingAttendance(null)} attendance={editingAttendance} />
            )}
            {error && <Alert type={ALERT.ERROR}>{error}</Alert>}
            {isLoading && <Loader className="attendance__loader" />}
            {!error && !isLoading && attendances.length < 1 && (
                <Alert type={ALERT.INFO}>На текущий момент нет ни одной записи.</Alert>
            )}
            {!error && !isLoading && attendances.length > 1 && (
                <>
                    <div className="attendance__table-wrapper">
                        <Table className="attendance__table">
                            <TableHead>
                                <TableHeadCell>Номер занятия</TableHeadCell>
                                <TableHeadCell>Фамилия И.О</TableHeadCell>
                                <TableHeadCell>Дата</TableHeadCell>
                                <TableHeadCell>Кол-во часов</TableHeadCell>
                                <TableHeadCell>Зачет/Незачет</TableHeadCell>
                                <TableHeadCell>Тема занятия</TableHeadCell>
                                <TableHeadCell>Отдел</TableHeadCell>
                                <TableHeadCell>Преподаватель</TableHeadCell>
                            </TableHead>
                            <tbody
                                className={`attendance__table-body ${isFetching && "attendance__table-body--opacity"}`}
                            >
                                {attendances.map((attendance) => (
                                    <TableBodyRow
                                        key={`${attendance.studentId}${attendance.lessonId}`}
                                        onClick={(event) => handleOpenEditing(event, attendance)}
                                    >
                                        <TableBodyCell>{attendance.lessonId}</TableBodyCell>
                                        <TableBodyCell>{attendance.name}</TableBodyCell>
                                        <TableBodyCell>{formatDate(attendance.date)}</TableBodyCell>
                                        <TableBodyCell>{attendance.duration}</TableBodyCell>
                                        <TableBodyCell>{ATTENDACE_RESULT_VALUE[attendance.success]}</TableBodyCell>
                                        <TableBodyCell className="attendance__table-topic-cell">
                                            {attendance.topic}
                                        </TableBodyCell>
                                        <TableBodyCell className="attendance__table-subdepartment-cell">
                                            {attendance.subDepartment}
                                        </TableBodyCell>
                                        <TableBodyCell>{attendance.teacher}</TableBodyCell>
                                    </TableBodyRow>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            className="attendance__pagination"
                            pageCount={totalPages}
                            onPageChange={handlePageChange}
                            renderOnZeroPageCount={() => null}
                            initialPage={Number(page) - 1}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Attendance;
