// Email Templates for RFP System
// This file contains all email templates with proper HTML styling and branding

export const EMAIL_TEMPLATES = {
  // Base template with logo and styling
  baseTemplate: (content: string, title: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <title>${title}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px 20px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 500;
            }
            .highlight {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
            }
            .info-box {
                background-color: #e3f2fd;
                border: 1px solid #bbdefb;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
            }
            .success-box {
                background-color: #e8f5e8;
                border: 1px solid #c8e6c9;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
            }
            .warning-box {
                background-color: #fff3e0;
                border: 1px solid #ffcc02;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
            }
            .rfp-details {
                background-color: #f8f9fa;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
            }
            .rfp-details h3 {
                margin-top: 0;
                color: #495057;
            }
            .rfp-details p {
                margin: 8px 0;
            }
            .rfp-details strong {
                color: #495057;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo"><i class="fa fa-envelope" style="font-size:24px;color:#3b82f6"></i> RFPFlow</div>
                <p>Streamline Your RFP Process</p>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>© 2024 RFP Pro. All rights reserved.</p>
                <p>This email was sent from an automated system. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  // RFP Published Notification
  rfpPublished: (rfp: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">🎉 New RFP Available!</h2>
        
        <div class="info-box">
            <p><strong>A new Request for Proposal has been published and is now available for your review.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 RFP Details</h3>
            <p><strong>Title:</strong> ${rfp.title}</p>
            <p><strong>Description:</strong> ${rfp.current_version?.description || 'N/A'}</p>
            <p><strong>Requirements:</strong> ${rfp.current_version?.requirements || 'N/A'}</p>
            <p><strong>Deadline:</strong> ${rfp.current_version?.deadline ? new Date(rfp.current_version.deadline).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Budget Range:</strong> $${rfp.current_version?.budget_min?.toLocaleString() || 'N/A'} - $${rfp.current_version?.budget_max?.toLocaleString() || 'N/A'}</p>
            <p><strong>Published by:</strong> ${rfp.buyer?.email || 'N/A'}</p>
        </div>

        <div class="highlight">
            <p><strong>💡 Ready to respond?</strong></p>
            <p>Log in to your dashboard to view the complete RFP details and submit your proposal.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/rfps/${rfp.id}" style="color: white !important" class="button">
            View RFP Details
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            If you have any questions about this RFP, please contact the buyer directly through the platform.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `New RFP: ${rfp.title}`);
  },

  // Response Submitted Notification
  responseSubmitted: (response: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">📝 New Response Received</h2>
        
        <div class="success-box">
            <p><strong>A supplier has submitted a response to your RFP.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Response Details</h3>
            <p><strong>RFP Title:</strong> ${response.rfp.title}</p>
            <p><strong>Supplier:</strong> ${response.supplier.email}</p>
            <p><strong>Proposed Budget:</strong> $${response.proposed_budget?.toLocaleString() || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
            <p><strong>Submitted:</strong> ${new Date(response.created_at).toLocaleString()}</p>
        </div>

        <div class="highlight">
            <p><strong>🔍 Review Required</strong></p>
            <p>Please review this response and take appropriate action (approve, reject, or request changes).</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/responses/${response.id}" style="color: white !important" class="button">
            Review Response
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            You can manage all responses to this RFP from your dashboard.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `New Response: ${response.rfp.title}`);
  },

  // Response Status Change Notifications
  responseMovedToReview: (response: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">🔍 Response Under Review</h2>
        
        <div class="info-box">
            <p><strong>Your response has been moved to review status.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Response Details</h3>
            <p><strong>RFP Title:</strong> ${response.rfp.title}</p>
            <p><strong>Your Email:</strong> ${response.supplier.email}</p>
            <p><strong>Proposed Budget:</strong> $${response.proposed_budget?.toLocaleString() || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">Under Review</span></p>
        </div>

        <div class="highlight">
            <p><strong>⏳ What happens next?</strong></p>
            <p>The buyer is now evaluating your proposal. You will be notified once a decision has been made.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/responses/${response.id}" style="color: white !important" class="button">
            View Response
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            Thank you for your patience during the review process.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `Response Under Review: ${response.rfp.title}`);
  },

  responseApproved: (response: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">✅ Response Approved!</h2>
        
        <div class="success-box">
            <p><strong>🎉 Congratulations! Your response has been approved by the buyer.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Response Details</h3>
            <p><strong>RFP Title:</strong> ${response.rfp.title}</p>
            <p><strong>Your Email:</strong> ${response.supplier.email}</p>
            <p><strong>Proposed Budget:</strong> $${response.proposed_budget?.toLocaleString() || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">Approved</span></p>
        </div>

        <div class="highlight">
            <p><strong>🎯 Next Steps</strong></p>
            <p>Your proposal has been approved and is now being considered for the final award decision.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/responses/${response.id}" style="color: white !important" class="button">
            View Response
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            You will be notified if your response is selected as the winning proposal.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `Response Approved: ${response.rfp.title}`);
  },

  responseRejected: (response: any, rejectionReason?: string) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">❌ Response Update</h2>
        
        <div class="warning-box">
            <p><strong>Your response has been reviewed and was not selected.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Response Details</h3>
            <p><strong>RFP Title:</strong> ${response.rfp.title}</p>
            <p><strong>Your Email:</strong> ${response.supplier.email}</p>
            <p><strong>Proposed Budget:</strong> $${response.proposed_budget?.toLocaleString() || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #f44336; font-weight: bold;">Rejected</span></p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        </div>

        <div class="highlight">
            <p><strong>💡 Keep Going!</strong></p>
            <p>Don't be discouraged. Continue to browse other RFPs and submit new proposals.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/rfps/browse" style="color: white !important" class="button">
            Browse More RFPs
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            Thank you for your interest in this opportunity.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `Response Update: ${response.rfp.title}`);
  },

  responseAwarded: (response: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">🏆 You Won!</h2>
        
        <div class="success-box">
            <p><strong>🎉 Congratulations! Your response has been awarded the contract!</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Award Details</h3>
            <p><strong>RFP Title:</strong> ${response.rfp.title}</p>
            <p><strong>Your Email:</strong> ${response.supplier.email}</p>
            <p><strong>Awarded Budget:</strong> $${response.proposed_budget?.toLocaleString() || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">Awarded</span></p>
        </div>

        <div class="highlight">
            <p><strong>🎯 Next Steps</strong></p>
            <p>The buyer will contact you soon to discuss the next steps for project execution.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/responses/${response.id}" style="color: white !important" class="button">
            View Award Details
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            Congratulations on winning this contract! We wish you success with the project.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `Contract Awarded: ${response.rfp.title}`);
  },

  rfpAwarded: (rfp: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">🏆 RFP Awarded</h2>
        
        <div class="info-box">
            <p><strong>The RFP has been awarded to a supplier.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 RFP Details</h3>
            <p><strong>Title:</strong> ${rfp.title}</p>
            <p><strong>Description:</strong> ${rfp.current_version?.description || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">Awarded</span></p>
        </div>

        <div class="highlight">
            <p><strong>🙏 Thank You</strong></p>
            <p>Thank you for your participation in this RFP process.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/rfps/${rfp.id}" style="color: white !important" class="button">
            View RFP Details
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            Continue to browse other opportunities on our platform.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `RFP Awarded: ${rfp.title}`);
  },

  responseReopened: (response: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">📝 Response Reopened for Editing</h2>

        <div class="info-box">
            <p><strong>Your response has been reopened for editing by the buyer.</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Response Details</h3>
            <p><strong>RFP Title:</strong> ${response.rfp.title}</p>
            <p><strong>Your Email:</strong> ${response.supplier.email}</p>
            <p><strong>Proposed Budget:</strong> $${response.proposed_budget?.toLocaleString() || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #2196f3; font-weight: bold;">Reopened for Editing</span></p>
        </div>

        <div class="highlight">
            <p><strong>🎯 What You Can Do Now</strong></p>
            <p>You can now edit your response and resubmit it for review. Make sure to address any previous feedback.</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/responses/${response.id}" style="color: white !important" class="button">
            Edit Your Response
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            Take advantage of this opportunity to improve your response. Good luck!
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, `Response Reopened: ${response.rfp.title}`);
  },

  // User Registration Welcome
  userRegistered: (user: any) => {
    const content = `
        <h2 style="color: #495057; margin-bottom: 20px;">👋 Welcome to RFP Pro!</h2>
        
        <div class="success-box">
            <p><strong>🎉 Your account has been successfully created!</strong></p>
        </div>

        <div class="rfp-details">
            <h3>📋 Account Details</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role?.name || 'User'}</p>
            <p><strong>Registration Date:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        <div class="highlight">
            <p><strong>🚀 Get Started</strong></p>
            <p>Log in to your account and start exploring the platform!</p>
        </div>

        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color: white !important" class="button">
            Log In to Your Account
        </a>

        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            If you have any questions, please don't hesitate to contact our support team.
        </p>
    `;
    return EMAIL_TEMPLATES.baseTemplate(content, 'Welcome to RFP Pro');
  },
};
