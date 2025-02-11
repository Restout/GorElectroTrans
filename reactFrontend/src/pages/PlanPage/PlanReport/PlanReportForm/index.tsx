import React, { FormEvent } from "react";

import { useUnit } from "effector-react";

import ActionButton from "components/ActionButton";
import Alert, { ALERT } from "components/Alert";
import Dropdown from "components/formElements/Dropdown";
import Label from "components/formElements/Label";

import {
    $activeOption,
    $error,
    $isSubmitting,
    $periodsOptions,
    activeOptionChanged,
    formSubmitted,
} from "./model/model";

import styles from "./styles.module.scss";

const PlanReportForm: React.FC = () => {
    const [isSubmitting] = useUnit([$isSubmitting]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        formSubmitted();
    };

    return (
        <>
            <ErrorAlert />
            <form onSubmit={handleSubmit} aria-label="Отчетность">
                <Period />
                <div className={styles.controls}>
                    <ActionButton
                        className={styles.submitBtn}
                        type="submit"
                        disabled={isSubmitting}
                        colorType="success"
                    >
                        Скачать
                    </ActionButton>
                </div>
            </form>
        </>
    );
};

export default PlanReportForm;

function Period() {
    const [options, activeOption, isSubmitting] = useUnit([
        $periodsOptions,
        $activeOption,
        $isSubmitting,
    ]);

    if (activeOption === null) return null;

    return (
        <Label className={styles.label}>
            <Dropdown
                className={styles.select}
                options={options}
                initialOption={activeOption}
                onChange={activeOptionChanged}
                disabled={isSubmitting}
            />
        </Label>
    );
}

function ErrorAlert() {
    const error = useUnit($error);
    if (!error) return null;
    return (
        <Alert className={styles.alert} type={ALERT.ERROR}>
            {error}
        </Alert>
    );
}
