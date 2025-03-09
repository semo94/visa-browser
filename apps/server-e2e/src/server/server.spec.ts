import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure API_PREFIX is available
const API_PREFIX = process.env.API_PREFIX || 'http://localhost:3000/api/v1';

interface SuccessResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  requestId: string;
  message: string;
  data: {
    message: string;
  };
}

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errorName: string;
  requestId: string;
}

describe('API Endpoints', () => {
  describe('GET API endpoint', () => {
    it('should return a successful response with the correct format', async () => {
      const response = await axios.get<SuccessResponse>(API_PREFIX);
      const data = response.data;

      // Check status code
      expect(response.status).toBe(200);

      // Verify response body structure
      expect(data.statusCode).toBe(200);
      expect(data.path).toBe('/api/v1');
      expect(data.method).toBe('GET');
      expect(data.message).toBe('Success');
      expect(data.data.message).toBe('Hello API');

      // Validate timestamp format (ISO string)
      expect(Date.parse(data.timestamp)).not.toBeNaN();

      // Validate request ID format (UUID format)
      expect(data.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('should include the current date in the timestamp', async () => {
      const response = await axios.get<SuccessResponse>(API_PREFIX);
      const data = response.data;
      const responseDate = new Date(data.timestamp);
      const currentDate = new Date();

      // Check that timestamp is within 10 seconds of current time
      const timeDifference = Math.abs(currentDate.getTime() - responseDate.getTime());
      expect(timeDifference).toBeLessThan(10000); // 10 seconds in milliseconds
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent endpoints with a 404 response', async () => {
      const nonExistentPath = API_PREFIX.replace('/v1', '/v2');

      try {
        await axios.get(nonExistentPath);
        // If we reach this point, the request didn't fail as expected
        fail('Expected request to non-existent endpoint to fail with 404');
      } catch (error) {
        if (!axios.isAxiosError(error) || !error.response) {
          throw error; // Re-throw if it's not an axios error with response
        }

        const response = error.response;
        const data = response.data as ErrorResponse;

        expect(response.status).toBe(404);
        expect(data.statusCode).toBe(404);
        expect(data.path).toBe('/api/v2');
        expect(data.method).toBe('GET');
        expect(data.message).toBe('Cannot GET /api/v2');
        expect(data.errorName).toBe('NotFoundException');
        expect(data.requestId).toBe('unknown');

        // Validate timestamp format
        expect(Date.parse(data.timestamp)).not.toBeNaN();
      }
    });
  });
});