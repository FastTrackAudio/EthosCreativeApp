import { useQuery } from "react-query";
import axios from "axios";

// Add debug logs to the query
const { data: nextConcept } = useQuery({
  queryKey: ["next-concept", courseId],
  queryFn: async () => {
    console.log("Fetching next concept for courseId:", courseId);
    try {
      const response = await axios.get(`/api/courses/${courseId}/next-concept`);
      console.log("Next concept response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching next concept:", error);
      throw error;
    }
  },
}); 