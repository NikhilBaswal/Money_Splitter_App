type SplitExpenseDto = {
  payerId: number;
  amount: number;
  product: string;
  place: string;
  remarks: string;
  users: string[];
  date?: string;
  sdate?: string;
};
import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Expense } from './expense.entity';

@Controller('expenses')
export class ExpensesController {
  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Get all expenses for a user (payer or participant)
  @Get('user/:userId')
  async getExpensesForUser(@Param('userId') userIdParam: string) {
    const userId = Number(userIdParam);
    if (isNaN(userId)) return [];
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return [];
    const expenses = await this.expenseRepo.find({ relations: ['payer'] });
    console.log('Fetched expenses:', expenses.map(e => ({ id: e.id, amount: e.amount, users: e.users, payer: e.payer?.id })));
    // Only show expenses where the user is the payer or their userId is in the users array
    return expenses
      .filter(e => {
        // Defensive: e.users may be string or number[] or undefined
        const userIds = Array.isArray(e.users) ? e.users.map(String) : [];
        // Always include payer in the split, even if not in users array
        return e.payer.id === userId || userIds.includes(String(userId));
      })
      .map(e => {
        // Calculate share: total amount divided by (unique participants: payer + all users, no duplicates)
        const userIds = Array.isArray(e.users) ? e.users.map(String) : [];
        const allParticipantIds = [String(e.payer.id), ...userIds];
        // Remove duplicates
        const uniqueParticipantIds = Array.from(new Set(allParticipantIds));
        const totalParticipants = uniqueParticipantIds.length;
        let share = 0;
        if (totalParticipants > 0 && typeof e.amount === 'number' && !isNaN(e.amount)) {
          share = Number(e.amount) / totalParticipants;
        }
        console.log(`Expense ID ${e.id}: amount=${e.amount}, totalParticipants=${totalParticipants}, share=${share}`);
        share = Math.round(share * 100) / 100;
        return { ...e, share };
      });

  }

  @Post('split')
  async splitExpense(@Body() body: SplitExpenseDto) {
    const payer = await this.userRepo.findOne({ where: { id: body.payerId } });
    if (!payer) throw new HttpException('Payer not found', HttpStatus.NOT_FOUND);
    if (!body.users || body.users.length === 0) throw new HttpException('No users to split with', HttpStatus.BAD_REQUEST);
    // Store user IDs as strings
    const parsedAmount = typeof body.amount === 'string' ? parseFloat(body.amount) : Number(body.amount);
    console.log('Creating expense:', {
      payer: payer.id,
      amount: parsedAmount,
      product: body.product,
      users: body.users
    });
    // Calculate share for this expense
    const userIds = Array.isArray(body.users) ? body.users.map(String) : [];
    const allParticipantIds = [String(payer.id), ...userIds];
    const uniqueParticipantIds = Array.from(new Set(allParticipantIds));
    const totalParticipants = uniqueParticipantIds.length;
    let share = 0;
    if (totalParticipants > 0 && typeof parsedAmount === 'number' && !isNaN(parsedAmount)) {
      share = Number(parsedAmount) / totalParticipants;
    }
    share = Math.round(share * 100) / 100;
    const expense = this.expenseRepo.create({
      payer,
      amount: parsedAmount,
      product: body.product,
      place: body.place,
      remarks: body.remarks,
      users: body.users.map(String),
      share,
      date: body.date || undefined,
      sdate: body.sdate || body.date || undefined,
    });
    return this.expenseRepo.save(expense);
  }
}
