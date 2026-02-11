
import Blogs from "./ui/blogs";
import { FeatureSteps } from "./ui/feature-steps";

const featureSteps = [
    {
        step: 'Step 1',
        title: 'List Surplus Food',
        content: 'Donors (restaurants, hotels) list available food details, quantity, and pick-up time in seconds.',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2000&auto=format&fit=crop'
    },
    {
        step: 'Step 2',
        title: 'Instant Notification',
        content: 'Nearby NGOs and volunteers receive real-time alerts on our live map and can claim the donation instantly.',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2000&auto=format&fit=crop'
    },
    {
        step: 'Step 3',
        title: 'Track Impact',
        content: 'Food is collected and distributed. We track the meals saved and CO2 emissions prevented for every donation.',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000&auto=format&fit=crop'
    },
];

export default function ResQFeatures() {
    return (
        <div className="w-full">
            <div className="py-10">
                <FeatureSteps
                    features={featureSteps}
                    title="How ResQMeals Works"
                    autoPlayInterval={4000}
                    imageHeight="h-[400px]"
                />
            </div>
            <Blogs />
        </div>
    );
}
