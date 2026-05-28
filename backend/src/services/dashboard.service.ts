import { LeadStatus, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class DashboardService {
  async getStats(userId: string, role: Role) {
    const leadWhere = role === 'EMPLOYEE' ? { assignedToId: userId } : {};

    const [
      totalUsers,
      totalLeads,
      wonDeals,
      lostDeals,
      leadsByStatus,
      recentActivities,
      monthlyLeads,
    ] = await Promise.all([
      role === 'EMPLOYEE' ? Promise.resolve(0) : prisma.user.count(),
      prisma.lead.count({ where: leadWhere }),
      prisma.lead.count({ where: { ...leadWhere, status: 'WON' } }),
      prisma.lead.count({ where: { ...leadWhere, status: 'LOST' } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: leadWhere,
        _count: { status: true },
      }),
      prisma.activity.findMany({
        where: role === 'EMPLOYEE' ? { userId } : {},
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          lead: { select: { id: true, fullName: true } },
        },
      }),
      this.getMonthlyAnalytics(leadWhere),
    ]);

    const statusMap = Object.values(LeadStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<LeadStatus, number>,
    );
    for (const item of leadsByStatus) {
      statusMap[item.status] = item._count.status;
    }

    const conversionRate =
      totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100 * 100) / 100 : 0;

    return {
      stats: {
        totalUsers,
        totalLeads,
        wonDeals,
        lostDeals,
        conversionRate,
        activeLeads: totalLeads - wonDeals - lostDeals,
      },
      leadsByStatus: statusMap,
      monthlyAnalytics: monthlyLeads,
      recentActivities,
    };
  }

  private async getMonthlyAnalytics(where: Record<string, unknown>) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const leads = await prisma.lead.findMany({
      where: { ...where, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    });

    const months: { month: string; leads: number; won: number; lost: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthLeads = leads.filter((l) => {
        const lk = `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return lk === key;
      });
      months.push({
        month: label,
        leads: monthLeads.length,
        won: monthLeads.filter((l) => l.status === 'WON').length,
        lost: monthLeads.filter((l) => l.status === 'LOST').length,
      });
    }
    return months;
  }
}

export const dashboardService = new DashboardService();
