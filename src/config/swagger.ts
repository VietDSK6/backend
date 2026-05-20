import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'VolunConnect API',
      version: '1.0.0',
      description: 'API quản lý tình nguyện viên & gamification cho VolunConnect',
      contact: { name: 'VolunConnect Team' },
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ─── Common ──────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {},
            message: { type: 'string', example: 'OK' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            code: { type: 'integer' },
          },
        },
        PaginatedMeta: {
          type: 'object',
          properties: {
            items: { type: 'array', items: {} },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },

        // ─── Auth ────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['email', 'password', 'full_name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 6, example: '123456' },
            full_name: { type: 'string', example: 'Nguyễn Văn A' },
            role: { type: 'string', enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        RefreshInput: {
          type: 'object',
          required: ['refresh_token'],
          properties: {
            refresh_token: { type: 'string' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            user: { $ref: '#/components/schemas/UserPublic' },
          },
        },

        // ─── User ────────────────────────────────────
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string' },
            avatar_url: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            student_id: { type: 'string', nullable: true },
            faculty: { type: 'string', nullable: true },
            class_name: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            birthday: { type: 'string', format: 'date-time', nullable: true },
            social_link: { type: 'string', format: 'uri', nullable: true },
            emergency_contact_name: { type: 'string', nullable: true },
            emergency_contact_phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['STUDENT', 'ADMIN'] },
            reputation_score: { type: 'number' },
            total_hours: { type: 'number' },
            total_points: { type: 'integer' },
            current_points: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileInput: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            avatar_url: { type: 'string', format: 'uri' },
            phone: { type: 'string', nullable: true },
            student_id: { type: 'string', nullable: true },
            faculty: { type: 'string', nullable: true },
            class_name: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            birthday: { type: 'string', format: 'date-time', nullable: true },
            social_link: { type: 'string', format: 'uri', nullable: true },
            emergency_contact_name: { type: 'string', nullable: true },
            emergency_contact_phone: { type: 'string', nullable: true },
          },
        },

        // ─── Event ───────────────────────────────────
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            admin_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            cover_image: { type: 'string', nullable: true },
            location: { type: 'string' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            max_slots: { type: 'integer' },
            category: { type: 'string' },
            status: { type: 'string', enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateEventInput: {
          type: 'object',
          required: ['title', 'description', 'location', 'start_date', 'end_date', 'max_slots', 'category'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            max_slots: { type: 'integer', minimum: 1 },
            category: { type: 'string' },
            cover_image: { type: 'string', format: 'binary', description: 'File ảnh bìa (multipart/form-data)' },
          },
        },
        UpdateEventInput: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            max_slots: { type: 'integer', minimum: 1 },
            category: { type: 'string' },
          },
        },

        // ─── Application ────────────────────────────
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            event_id: { type: 'string', format: 'uuid' },
            student_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] },
            applied_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            student: { $ref: '#/components/schemas/UserPublic' },
            review: {
              nullable: true,
              allOf: [{ $ref: '#/components/schemas/Review' }],
            },
          },
        },
        ApplyInput: {
          type: 'object',
          required: ['event_id'],
          properties: {
            event_id: { type: 'string', format: 'uuid' },
          },
        },

        // ─── Review ─────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            event_id: { type: 'string', format: 'uuid' },
            student_id: { type: 'string', format: 'uuid' },
            admin_id: { type: 'string', format: 'uuid' },
            application_id: { type: 'string', format: 'uuid' },
            rating_score: { type: 'integer', minimum: 1, maximum: 5 },
            feedback_text: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateReviewInput: {
          type: 'object',
          required: ['application_id', 'rating_score'],
          properties: {
            application_id: { type: 'string', format: 'uuid' },
            rating_score: { type: 'integer', minimum: 1, maximum: 5 },
            feedback_text: { type: 'string' },
          },
        },

        // ─── Notification ───────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            message: { type: 'string' },
            is_read: { type: 'boolean' },
            type: { type: 'string', enum: ['APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'REVIEW_RECEIVED'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // ─── Badge ──────────────────────────────────
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            icon_url: { type: 'string' },
            required_hours: { type: 'number' },
            earned_at: { type: 'string', format: 'date-time', description: 'Chỉ khi trả về badge của user' },
          },
        },

        // ─── FAQ ───────────────────────────────────
        FAQ: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            question: { type: 'string' },
            answer: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        FAQInput: {
          type: 'object',
          required: ['question', 'answer'],
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
            is_active: { type: 'boolean', default: true },
          },
        },

        // ─── Send Notification ──────────────────────
        SendNotificationInput: {
          type: 'object',
          required: ['target', 'title', 'message', 'type'],
          properties: {
            target: { type: 'string', enum: ['ALL', 'SPECIFIC'] },
            userIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
          },
        },

        // ─── Dashboard ──────────────────────────────
        DashboardStats: {
          type: 'object',
          properties: {
            total_events: { type: 'integer' },
            pending_applications: { type: 'integer' },
            total_students: { type: 'integer' },
            total_hours: { type: 'number' },
            total_points_distributed: { type: 'integer' },
            total_rewards_redeemed: { type: 'integer' },
          },
        },
        HoursByMonth: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              hours: { type: 'number' },
            },
          },
        },
        ApplicationStatusChart: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              value: { type: 'integer' },
              color: { type: 'string' },
            },
          },
        },
        PointsSummary: {
          type: 'object',
          properties: {
            current_points: { type: 'integer' },
            total_points: { type: 'integer' },
            month: { type: 'string', example: '2026-05' },
            points_earned: { type: 'integer' },
            points_spent: { type: 'integer' },
            events_completed: { type: 'integer' },
            rewards_redeemed: { type: 'integer' },
          },
        },
        ProfileSummary: {
          type: 'object',
          properties: {
            completed_events: { type: 'integer' },
            pending_applications: { type: 'integer' },
            upcoming_events: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
            latest_completed_events: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
            recent_applications: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
            points_summary: { $ref: '#/components/schemas/PointsSummary' },
            badges_summary: {
              type: 'object',
              properties: {
                earned_count: { type: 'integer' },
                total_count: { type: 'integer' },
                earned_badges: { type: 'array', items: { $ref: '#/components/schemas/Badge' } },
                next_badge: {
                  nullable: true,
                  allOf: [{ $ref: '#/components/schemas/Badge' }],
                  properties: {
                    progress_percent: { type: 'integer' },
                    remaining_hours: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        PointsAnalytics: {
          type: 'object',
          properties: {
            total_points_distributed: { type: 'integer' },
            points_distributed_this_month: { type: 'integer' },
            total_points_redeemed: { type: 'integer' },
            total_redemption_count: { type: 'integer' },
            points_redeemed_this_month: { type: 'integer' },
            redemptions_this_month: { type: 'integer' },
            avg_points_per_student: { type: 'integer' },
            active_students: { type: 'integer' },
          },
        },
        PointsByMonth: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              points_earned: { type: 'integer' },
              points_spent: { type: 'integer' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Đăng ký, đăng nhập, refresh token, đăng xuất' },
      { name: 'Users', description: 'Quản lý thông tin người dùng' },
      { name: 'Events', description: 'Quản lý sự kiện tình nguyện' },
      { name: 'Applications', description: 'Đăng ký & duyệt đơn tình nguyện' },
      { name: 'Reviews', description: 'Đánh giá tình nguyện viên' },
      { name: 'Notifications', description: 'Thông báo' },
      { name: 'Dashboard', description: 'Thống kê cho admin' },
      { name: 'FAQs', description: 'Câu hỏi thường gặp' },
      { name: 'Badges', description: 'Huy hiệu thành tích' },
    ],
    paths: {
      // ═══════════════════ AUTH ═══════════════════
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng ký tài khoản',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
          responses: {
            201: { description: 'Đăng ký thành công', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            409: { description: 'Email đã tồn tại' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng nhập',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
          responses: {
            200: { description: 'Đăng nhập thành công', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/AuthTokens' } } }] } } } },
            401: { description: 'Sai email hoặc mật khẩu' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Làm mới access token',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshInput' } } } },
          responses: {
            200: { description: 'Token mới', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { properties: { access_token: { type: 'string' } } } } }] } } } },
            401: { description: 'Refresh token không hợp lệ' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng xuất',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshInput' } } } },
          responses: { 200: { description: 'Đăng xuất thành công' } },
        },
      },

      // ═══════════════════ USERS ═══════════════════
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Danh sách người dùng (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Tìm theo tên hoặc email' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { 200: { description: 'Danh sách phân trang', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/PaginatedMeta' } } }] } } } } },
        },
      },
      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Lấy thông tin cá nhân',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/UserPublic' } } }] } } } } },
        },
        put: {
          tags: ['Users'],
          summary: 'Cập nhật hồ sơ cá nhân',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileInput' } } } },
          responses: { 200: { description: 'Cập nhật thành công' } },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Lấy thông tin user theo ID',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/UserPublic' } } }] } } } },
            404: { description: 'Không tìm thấy' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Xóa người dùng (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Xóa thành công' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/users/{id}/role': {
        put: {
          tags: ['Users'],
          summary: 'Cập nhật quyền người dùng (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { role: { type: 'string', enum: ['STUDENT', 'ADMIN'] } } } } } },
          responses: { 200: { description: 'Cập nhật thành công' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/users/me/points-summary': {
        get: {
          tags: ['Users'],
          summary: 'Tổng hợp điểm của tôi trong tháng',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'month', in: 'query', schema: { type: 'string', example: '2026-05' }, description: 'Tháng (YYYY-MM), mặc định tháng hiện tại' },
          ],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/PointsSummary' } } }] } } } } },
        },
      },
      '/users/me/profile-summary': {
        get: {
          tags: ['Users'],
          summary: 'Tổng hợp dữ liệu cho trang hồ sơ cá nhân',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/ProfileSummary' } } }] } } } } },
        },
      },
      '/users/{id}/badges': {
        get: {
          tags: ['Users'],
          summary: 'Lấy danh sách huy hiệu của user',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Badge' } } } }] } } } } },
        },
      },

      // ═══════════════════ EVENTS ═══════════════════
      '/events': {
        get: {
          tags: ['Events'],
          summary: 'Danh sách sự kiện (public)',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Tìm theo tiêu đề' },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          ],
          responses: { 200: { description: 'Danh sách phân trang', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/PaginatedMeta' } } }] } } } } },
        },
        post: {
          tags: ['Events'],
          summary: 'Tạo sự kiện mới (Admin)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': { schema: { $ref: '#/components/schemas/CreateEventInput' } },
              'application/json': { schema: { $ref: '#/components/schemas/CreateEventInput' } },
            },
          },
          responses: { 201: { description: 'Tạo thành công' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/events/{id}': {
        get: {
          tags: ['Events'],
          summary: 'Chi tiết sự kiện (public)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'OK' }, 404: { description: 'Không tìm thấy' } },
        },
        put: {
          tags: ['Events'],
          summary: 'Cập nhật sự kiện (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateEventInput' } } } },
          responses: { 200: { description: 'Cập nhật thành công' }, 403: { description: 'Không có quyền' } },
        },
        delete: {
          tags: ['Events'],
          summary: 'Xóa sự kiện (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Xóa thành công' }, 400: { description: 'Đang có người tham gia' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/events/{id}/applications': {
        get: {
          tags: ['Events'],
          summary: 'Danh sách đơn đăng ký của sự kiện (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Application' } } } }] } } } }, 403: { description: 'Không có quyền' } },
        },
      },
      '/events/{id}/export': {
        get: {
          tags: ['Events'],
          summary: 'Xuất Excel danh sách tình nguyện viên (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'File Excel', content: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { schema: { type: 'string', format: 'binary' } } } },
            403: { description: 'Không có quyền' },
          },
        },
      },

      // ═══════════════════ APPLICATIONS ═══════════════════
      '/applications': {
        post: {
          tags: ['Applications'],
          summary: 'Đăng ký tham gia sự kiện (Student)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApplyInput' } } } },
          responses: { 201: { description: 'Đăng ký thành công' }, 400: { description: 'Hết chỗ' }, 409: { description: 'Đã đăng ký rồi' } },
        },
      },
      '/applications/my': {
        get: {
          tags: ['Applications'],
          summary: 'Danh sách đơn đăng ký của tôi (Student)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Application' } } } }] } } } } },
        },
      },
      '/applications/{id}/approve': {
        patch: {
          tags: ['Applications'],
          summary: 'Duyệt đơn (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Đã duyệt' }, 400: { description: 'Đơn không ở trạng thái chờ' } },
        },
      },
      '/applications/{id}/reject': {
        patch: {
          tags: ['Applications'],
          summary: 'Từ chối đơn (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Đã từ chối' }, 400: { description: 'Đơn không ở trạng thái chờ' } },
        },
      },
      '/applications/{id}/complete': {
        patch: {
          tags: ['Applications'],
          summary: 'Đánh dấu hoàn thành (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Đã hoàn thành' }, 400: { description: 'Đơn chưa được duyệt' } },
        },
      },

      // ═══════════════════ REVIEWS ═══════════════════
      '/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Đánh giá tình nguyện viên (Admin)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReviewInput' } } } },
          responses: { 201: { description: 'Đánh giá thành công' }, 400: { description: 'Đơn chưa hoàn thành' }, 409: { description: 'Đã đánh giá rồi' } },
        },
      },
      '/reviews/student/{id}': {
        get: {
          tags: ['Reviews'],
          summary: 'Lấy đánh giá của student',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Student ID' }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Review' } } } }] } } } } },
        },
      },

      // ═══════════════════ NOTIFICATIONS ═══════════════════
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Danh sách thông báo',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } }] } } } } },
        },
      },
      '/notifications/send': {
        post: {
          tags: ['Notifications'],
          summary: 'Gửi thông báo (Admin)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SendNotificationInput' } } } },
          responses: { 200: { description: 'Đã gửi' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Đánh dấu đã đọc',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'OK' }, 404: { description: 'Không tìm thấy' } },
        },
      },
      '/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Đánh dấu tất cả đã đọc',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK' } },
        },
      },

      // ═══════════════════ DASHBOARD ═══════════════════
      '/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Thống kê tổng quan (Admin)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/DashboardStats' } } }] } } } } },
        },
      },
      '/dashboard/hours-by-month': {
        get: {
          tags: ['Dashboard'],
          summary: 'Giờ tình nguyện theo tháng (Admin)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/HoursByMonth' } } }] } } } } },
        },
      },
      '/dashboard/application-status': {
        get: {
          tags: ['Dashboard'],
          summary: 'Biểu đồ trạng thái đơn (Admin)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/ApplicationStatusChart' } } }] } } } } },
        },
      },
      '/dashboard/points-analytics': {
        get: {
          tags: ['Dashboard'],
          summary: 'Phân tích điểm thưởng (Admin)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/PointsAnalytics' } } }] } } } } },
        },
      },
      '/dashboard/points-by-month': {
        get: {
          tags: ['Dashboard'],
          summary: 'Điểm theo tháng (Admin)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/PointsByMonth' } } }] } } } } },
        },
      },

      // ═══════════════════ FAQS ═══════════════════
      '/faqs': {
        get: {
          tags: ['FAQs'],
          summary: 'Danh sách FAQ (Public)',
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/FAQ' } } } }] } } } } },
        },
        post: {
          tags: ['FAQs'],
          summary: 'Tạo FAQ mới (Admin)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FAQInput' } } } },
          responses: { 201: { description: 'Tạo thành công' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/faqs/all': {
        get: {
          tags: ['FAQs'],
          summary: 'Danh sách tất cả FAQ (Admin)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/FAQ' } } } }] } } } } },
        },
      },
      '/faqs/{id}': {
        put: {
          tags: ['FAQs'],
          summary: 'Cập nhật FAQ (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FAQInput' } } } },
          responses: { 200: { description: 'Cập nhật thành công' }, 403: { description: 'Không có quyền' } },
        },
        delete: {
          tags: ['FAQs'],
          summary: 'Xóa FAQ (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Xóa thành công' }, 403: { description: 'Không có quyền' } },
        },
      },

      // ═══════════════════ BADGES ═══════════════════
      '/badges': {
        get: {
          tags: ['Badges'],
          summary: 'Danh sách huy hiệu (Public)',
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Badge' } } } }] } } } } },
        },
        post: {
          tags: ['Badges'],
          summary: 'Tạo huy hiệu mới (Admin)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, icon_url: { type: 'string' }, required_hours: { type: 'number' } } } } } },
          responses: { 201: { description: 'Tạo thành công' }, 403: { description: 'Không có quyền' } },
        },
      },
      '/badges/{id}': {
        put: {
          tags: ['Badges'],
          summary: 'Cập nhật huy hiệu (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, icon_url: { type: 'string' }, required_hours: { type: 'number' } } } } } },
          responses: { 200: { description: 'Cập nhật thành công' }, 403: { description: 'Không có quyền' } },
        },
        delete: {
          tags: ['Badges'],
          summary: 'Xóa huy hiệu (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Xóa thành công' }, 403: { description: 'Không có quyền' } },
        },
      },
    },
  },
  apis: [], // We define everything inline above, no JSDoc annotations needed
};

export const swaggerSpec = swaggerJsdoc(options);
