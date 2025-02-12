import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"


function Help_Page() {
    return ( 
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Help</h1>
            <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>How do i award Housepoints to a student?</AccordionTrigger>
                <AccordionContent>
                Either click the "Award Housepoints" button in the sidebar or navigate to the student's profile using the students tab and click the "Award Housepoints" button.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>How do i add a new student?</AccordionTrigger>
                <AccordionContent>
                Navigate to the <a className="underline" href="/students">Students tab</a> and click the "Add new student" button.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>How do i add a new Teacher?</AccordionTrigger>
                <AccordionContent>
                Please contact the system administrator to add a new member.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem className="hidden" value="item-4">
                <AccordionTrigger>I want to remove housepoints from a student how do i do that?</AccordionTrigger>
                <AccordionContent>
                In the menu to award Housepoins the ammount field can go into the minus, set that to the ammount to remove.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>How do i delete/modify a student?</AccordionTrigger>
                <AccordionContent>
                Navigate to the <a className="underline" href="/students">Students tab</a> click on the three dots on the right side of the student you want to modify and select the action you want to take.
                </AccordionContent>
            </AccordionItem>
            </Accordion>

        </div>
    );
}

export default Help_Page;