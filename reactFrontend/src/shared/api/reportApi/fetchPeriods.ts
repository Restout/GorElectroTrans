import { isCancel } from "axios";
import { createEffect } from "effector";

import { IReportPeriod } from "pages/PlanPage/PlanReport/PlanReportForm/model/model";

import { authRequestFx } from "..";
import { ApiError, AuthError, DepParams } from "../types";

export const fetchPeriodsFx = createEffect<
    DepParams<null>,
    IReportPeriod[],
    ApiError
>(async ({ depId, controller }) => {
    try {
        const response = await authRequestFx({
            method: "GET",
            url: `/dep_${depId}/report/date`,
            signal: controller.signal,
        });
        return response.data;
    } catch (error) {
        if (isCancel(error)) {
            const customError: ApiError = {
                message: "Запрос отменен",
                isCanceled: true,
            };
            throw customError;
        } else {
            const err = error as AuthError;
            const message =
                err?.response?.data?.message ??
                "Не удалось получить данные с сервера";
            const customError: ApiError = { message, isCanceled: false };
            throw customError;
        }
    }
});
