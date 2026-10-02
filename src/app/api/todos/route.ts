import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { Todo } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { isValueType, readItemValue, storeItemValue } from '@/lib/encryption';

function presentItem(item: any) {
  const obj = item.toObject ? item.toObject() : item;
  const encrypted = obj.encrypted !== false;
  return {
    ...obj,
    value: readItemValue(obj.value, encrypted),
    encrypted,
    valueType: isValueType(obj.valueType) ? obj.valueType : 'text',
  };
}

function prepareItem(item: any) {
  const encrypted = item.encrypted !== false;
  const prepared: any = {
    ...item,
    value: storeItemValue(item.value, encrypted),
    encrypted,
    valueType: isValueType(item.valueType) ? item.valueType : 'text',
  };

  if (prepared._id && String(prepared._id).startsWith('temp_')) {
    delete prepared._id;
    if (!prepared.createdAt) {
      prepared.createdAt = new Date().toISOString();
    }
  }

  return prepared;
}

// GET all todos for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const todos = await Todo.find({ user: session.user.id }).sort({ createdAt: -1 });
    
    // Ensure all items have targetDate and status fields with defaults, and decrypt values
    const processedTodos = todos.map((todo: any) => ({
      ...todo.toObject(),
      items: todo.items.map((item: any) => ({
        ...item.toObject(),
        ...presentItem(item),
        targetDate: item.targetDate || undefined,
        status: item.status || 'ETS'
      }))
    }));
    
    return NextResponse.json(processedTodos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// CREATE a new todo for authenticated user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const data = await request.json();
    
    // Encrypt item values if they exist
    if (data.items) {
      data.items = data.items.map((item: any) => prepareItem(item));
    }
    
    // Add user ID to the todo
    const todoData = {
      ...data,
      user: session.user.id
    };
    
    const todo = await Todo.create(todoData);
    
    // Decrypt before returning
    const responseTodo = {
      ...todo.toObject(),
      items: todo.items.map((item: any) => ({
        ...item.toObject(),
        ...presentItem(item),
      }))
    };

    return NextResponse.json(responseTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
