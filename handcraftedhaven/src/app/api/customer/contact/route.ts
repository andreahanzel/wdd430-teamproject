import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

// Simple email sending simulation function
async function sendEmail(options: { to: string, subject: string, text: string }) {
    try {
        // Log email for debugging purposes
        console.log('Sending email:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Message:', options.text);
        
        // Simulate a successful email send
        return { success: true, messageId: `email_${Date.now()}` };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
    }

    // POST /api/customer/contact - Submit a contact form
    export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { subject, message } = await req.json()

        if (!subject || !message) {
        return NextResponse.json(
            { error: 'Subject and message are required' },
            { status: 400 }
        )
        }

        // Create a message object
        const contactMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name || 'Unknown User',
        subject,
        message,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        }

        // Create a placeholder order with minimal required fields to store the contact message
        await prisma.order.create({
        data: {
            userId: session.user.id,
            orderNumber: `CONTACT_${Date.now()}`,
            totalAmount: 0,
            shippingAddress: {}, // Empty object for required field
            paymentDetails: { 
            type: 'CONTACT_MESSAGE',
            ...contactMessage
            },
            status: 'CONTACT_MESSAGE',
        },
        })

        // Send email to admin
        await sendEmail({
        to: 'admin@handcraftedhaven.com',
        subject: `New Customer Message: ${subject}`,
        text: `From: ${session.user.name || 'Unknown User'} (${session.user.email})\n\nMessage:\n${message}`,
        })

        return NextResponse.json({
        message: 'Message sent successfully',
        contactId: contactMessage.id,
        })
    } catch (error) {
        console.error('Error sending contact message:', error)
        return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
        )
    }
    }

    // GET /api/customer/contact - Get all contact messages for the current user
    export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Find all orders that are actually contact messages
        const contactMessages = await prisma.order.findMany({
        where: {
            userId: session.user.id,
            status: 'CONTACT_MESSAGE',
        },
        orderBy: {
            createdAt: 'desc',
        },
        })

        // Format the response
        const formattedMessages = contactMessages.map(order => {
        const paymentDetails = order.paymentDetails as Record<string, any> | null;
        
        return {
            id: order.id,
            subject: paymentDetails?.subject || 'No Subject',
            message: paymentDetails?.message || 'No Message',
            status: paymentDetails?.status || 'PENDING',
            createdAt: order.createdAt,
        };
        });

        return NextResponse.json(formattedMessages)
    } catch (error) {
        console.error('Error fetching contact messages:', error)
        return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
        )
    }
}