"use server";

import { redirect } from "next/navigation";
import { saveMeal } from "./meals";

function isValidate(text) {
    return !text || text.trim() === '';
}

export async function shareMeal(prevState, formData) {
    const meal = {
        title: formData.get('title'),
        summary: formData.get('summary'),
        instructions: formData.get('instructions'),
        image: formData.get('image'),
        creator: formData.get('name'),
        creator_email: formData.get('email')
    }

    // validation

    if (
        isValidate(meal.title) ||
        isValidate(meal.summary) ||
        isValidate(meal.instructions) ||
        isValidate(meal.creator) ||
        isValidate(meal.creator_email) ||
        !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(meal.creator_email) ||
        !meal.image || meal.image.size === 0
    ) {
        return {
            message: 'Invalid input.'

        }
    }

    await saveMeal(meal);
    redirect('/meals')
}