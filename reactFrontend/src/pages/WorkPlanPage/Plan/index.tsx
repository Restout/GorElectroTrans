import React, { useState, MouseEvent, useEffect } from "react";
import Table from "../../../components/Table";
import TableBodyRow from "../../../components/Table/TableBodyRow";
import TableBodyCell from "../../../components/Table/TableBodyRow/TableBodyCell";
import TableHead from "../../../components/Table/TableHead";
import TableHeadCell from "../../../components/Table/TableHead/TableHeadCell";
import Pagination from "../../../components/Pagination";
import EditPlanModal from "../../../components/modals/plans/EditPlanModal";
import useLockedBody from "../../../hooks/useLockedBody";
import axios from "axios";
import PlanService from "../../../services/PlanService";
import { IPlan } from "../../../models/Plan";
import { formatDate } from "../../../helpers/formatDate";
import Alert from "../../../components/Alert";
import { ALERT } from "../../../constants/alertTypes";
import { usePlansContext } from "../../../context/plansContext";
import { useParams, useSearchParams } from "react-router-dom";
import Loader from "../../../components/Loader";

import "./styles.scss";

const LIMIT = 20;

const Plan: React.FC = () => {
    const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
    useLockedBody(!!editingPlan);

    const { divisionId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const { plans, setPlans } = usePlansContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState<number>(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const cancelToken = axios.CancelToken.source();
        setIsFetching(true);
        setError(null);

        const fetchPlans = async () => {
            try {
                const response = await PlanService.fetch(divisionId, {
                    params: {
                        page,
                        size: LIMIT,
                    },
                    cancelToken: cancelToken.token,
                });
                console.log(response);
                const totalPlans = response.headers["lessons_count"];
                const totalPages = totalPlans ? Math.ceil(totalPlans / LIMIT) : 1;
                setPlans(response.data);
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

        fetchPlans();

        return () => cancelToken.cancel();
    }, [page, setPlans, divisionId]);

    const handleOpenEditing = (event: MouseEvent<HTMLTableRowElement>, plan: IPlan) => {
        event.stopPropagation();
        setEditingPlan(plan);
    };

    const handlePageChange = (selectedItem: { selected: number }) => {
        setPage(selectedItem.selected + 1);
        searchParams.set("page", String(selectedItem.selected + 1));
        setSearchParams(searchParams);
    };

    return (
        <div className="plan">
            {!!editingPlan && <EditPlanModal closeEditing={() => setEditingPlan(null)} plan={editingPlan} />}
            {error && <Alert type={ALERT.ERROR}>{error}</Alert>}
            {isLoading && <Loader className="plan__loader" />}
            {!error && !isLoading && plans.length < 1 && (
                <Alert type={ALERT.INFO}>На текущий момент нет ни одной записи.</Alert>
            )}
            {!error && !isLoading && plans.length > 1 && (
                <>
                    <div className="plan__table-wrapper">
                        <Table className="plan__table">
                            <TableHead>
                                <TableHeadCell>Номер занятия</TableHeadCell>
                                <TableHeadCell>Дата</TableHeadCell>
                                <TableHeadCell>Длительность занятия</TableHeadCell>
                                <TableHeadCell>Кол-во обучающихся</TableHeadCell>
                                <TableHeadCell className="plan__table-topic-column">Тема занятия</TableHeadCell>
                                <TableHeadCell>Преподаватель</TableHeadCell>
                            </TableHead>
                            <tbody className={`plan__table-body ${isFetching && "plan__table-body--opacity"}`}>
                                {!error &&
                                    plans.map((plan) => (
                                        <TableBodyRow key={plan.id} onClick={(event) => handleOpenEditing(event, plan)}>
                                            <TableBodyCell>{plan.id}</TableBodyCell>
                                            <TableBodyCell className="plan__table-date-cell">
                                                {formatDate(plan.date)}
                                            </TableBodyCell>
                                            <TableBodyCell>{plan.duration}</TableBodyCell>
                                            <TableBodyCell>{plan.peoplePlanned}</TableBodyCell>
                                            <TableBodyCell>{plan.topic}</TableBodyCell>
                                            <TableBodyCell>{plan.teacher}</TableBodyCell>
                                        </TableBodyRow>
                                    ))}
                            </tbody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            className="plan__pagination"
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

export default Plan;
