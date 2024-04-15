import { isCancel } from "axios";
import { createEffect } from "effector";

import { IEmployee } from "models/Employee";

import { authRequestFx } from "..";
import { ApiError, AuthError, DepParams } from "../types";

export const postFx = createEffect<DepParams<IEmployee>, IEmployee, ApiError>(
    async ({ depId, data, controller }) => {
        try {
            const response = await authRequestFx({
                method: "POST",
                url: `/dep_${depId}/students/data`,
                data,
                signal: controller.signal,
            });
            return response.data as IEmployee;
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
                    "Не удалось добавить работника";
                const customError: ApiError = { message, isCanceled: false };
                throw customError;
            }
        }
    },
);
