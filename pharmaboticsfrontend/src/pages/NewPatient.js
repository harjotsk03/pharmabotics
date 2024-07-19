import { AddPatient } from "../components/AddPatient"

export const NewPatient = ({ doctorName }) => {
    return(
        <div className='w-4/5 ml-auto pl-10 pt-8 h-screen bg-gray-100'>

            <div>
                <AddPatient />
            </div>

        </div>
    )
}